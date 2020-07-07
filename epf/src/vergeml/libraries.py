import importlib
import os
import sys
import ctypes
import io
from vergeml.utils import VergeMLError
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

class Library:
    @staticmethod
    def is_installed():
        raise NotImplementedError

    @staticmethod
    def version():
        raise NotImplementedError

    @staticmethod
    def setup(env):
        raise NotImplementedError

class KerasLibrary(Library):
    @staticmethod
    def is_installed():
        return bool(importlib.util.find_spec('keras'))

    @staticmethod
    def version():
        stderr = sys.stderr
        sys.stderr = open(os.devnull, 'w')
        import keras # pylint: disable=E0401
        sys.stderr = stderr
        return keras.__version__

    @staticmethod
    def setup(env):
        stderr = sys.stderr
        sys.stderr = open(os.devnull, "w")
        # pylint: disable=W0612
        try:
            import keras
        except Exception as e:
            raise e
        finally:
            sys.stderr = stderr

        from keras import backend as K
        if K.backend() == 'tensorflow':
            TensorFlowLibrary.setup(env)
            K.set_session(TensorFlowLibrary.create_session(env))

    @staticmethod
    def callback(env, display_progress, stats):
        from keras.callbacks import Callback

        class KerasCallback(Callback):

            def __init__(self, env, display_progress, stats):
                self.env = env
                self.display_progress = display_progress
                self.stats = stats
                self.callback = None
                self.current_epoch = 0
                self.current_step = 0

            def on_train_begin(self, logs=None):
                logs = KerasCallback._xform_logs(logs)
                self.callback = env.progress_callback(self.params['epochs'], self.params['steps'],
                                                      self.display_progress, self.stats)

            def on_train_end(self, logs=None):
                logs = KerasCallback._xform_logs(logs)
                self.callback(self.current_epoch, self.current_step, **logs)

            def on_epoch_begin(self, epoch, logs=None):
                logs = KerasCallback._xform_logs(logs)
                self.callback(self.current_epoch, self.current_step, **logs)

            def on_epoch_end(self, epoch, logs=None):
                logs = KerasCallback._xform_logs(logs)
                self.current_epoch += 1
                self.callback(self.current_epoch, self.current_step, **logs)

            def on_batch_begin(self, batch, logs=None):
                logs = KerasCallback._xform_logs(logs)
                self.callback(self.current_epoch, self.current_step, **logs)

            def on_batch_end(self, batch, logs=None):
                logs = KerasCallback._xform_logs(logs)
                self.current_step += 1
                self.callback(self.current_epoch, self.current_step, **logs)

            @staticmethod
            def _xform_logs(logs):
                from copy import deepcopy
                logs = deepcopy(logs or {})
                for k in ('size', 'batch', 'epoch'):
                    if k in logs:
                        del logs[k]
                return {k.replace('_', '-'):v for k, v in logs.items()}

        return KerasCallback(env, display_progress, stats)

class TensorFlowLibrary(Library):
    @staticmethod
    def is_installed():
        return bool(importlib.util.find_spec('tensorflow'))

    @staticmethod
    def version():
        import tensorflow # pylint: disable=E0401
        tensorflow.logging.set_verbosity(tensorflow.logging.ERROR)
        return tensorflow.__version__ #pylint: disable=E1101

    @staticmethod
    def create_session(env):
        TensorFlowLibrary.setup(env)
        import tensorflow as tf # pylint: disable=E0401

        devid = env.get('device.id')
        if devid != "auto":
            if devid == "cpu":
                devnum = None
            else:
                devid, devnum = devid.split(":")
        else:
            devid = None
            devnum = None

        args = {}
        if devid == "cpu":
            args['device_count'] = {'GPU': 0}

        config = tf.ConfigProto(**args)
        if devid == "gpu":
            config.gpu_options.visible_device_list = devnum  # pylint: disable=locally-disabled, E1101

        device_memory = env.get('device.memory')
        if device_memory != 'auto':
            # pylint: disable=E1101
            try:
                fraction = float(device_memory.rstrip("%"))/100.
                config.gpu_options.per_process_gpu_memory_fraction = fraction
            except Exception:
                raise VergeMLError(f'Invalid value for device.memory: {device_memory}.',
                                    'Please use a percentage value, e.g. 50%.', hint_type='value', hint_key='device.memory')
            # pylint: enable=E1101

        if env.get('device.grow-memory'):
            config.gpu_options.allow_growth = True  # pylint: disable=locally-disabled, E1101

        return tf.Session(config=config)

    @staticmethod
    def setup(env):
        import tensorflow # pylint: disable=E0401
        tensorflow.logging.set_verbosity(tensorflow.logging.ERROR)
        tensorflow.set_random_seed(env.get('random-seed'))


class TorchLibrary(Library):
    @staticmethod
    def is_installed():
        return bool(importlib.util.find_spec('torch'))

    @staticmethod
    def version():
        import torch # pylint: disable=E0401
        return torch.__version__

    @staticmethod
    def setup(env):
        import torch # pylint: disable=E0401
        import torch.cuda # pylint: disable=E0401
        torch.manual_seed(env.get('random-seed'))
        torch.cuda.manual_seed(env.get('random-seed'))

class NumPyLibrary(Library):
    @staticmethod
    def is_installed():
        return bool(importlib.util.find_spec('numpy'))

    @staticmethod
    def version():
        import numpy # pylint: disable=E0401
        return numpy.__version__

    @staticmethod
    def setup(env):
        import numpy
        numpy.random.seed(env.get('random-seed'))

class PythonInterpreter(Library):
    @staticmethod
    def is_installed():
        return True

    @staticmethod
    def version():
        return ".".join(map(str, sys.version_info[:3]))

    @staticmethod
    def setup(env):
        import random
        random.seed(env.get('random-seed'))

_CUDA_SUCCESS = 0
_CUDA_OBJECT = None
_HAS_CUDA = None

class CudaLibrary(Library):

    @staticmethod
    def is_installed():
        CudaLibrary._setup_cuda_object()
        return _HAS_CUDA

    @staticmethod
    def version():
        cuda = _CUDA_OBJECT
        version = ctypes.c_int()
        if cuda.cuDriverGetVersion(ctypes.byref(version)) == _CUDA_SUCCESS:
            val = version.value
            maj = int(val/1000)
            min = int((val-(maj*1000))/10)
            return f"{maj}.{min}"
        else:
            return "Unknown"

    @staticmethod
    def devices():

        cuda = _CUDA_OBJECT
        CU_DEVICE_ATTRIBUTE_MULTIPROCESSOR_COUNT = 16
        CU_DEVICE_ATTRIBUTE_MAX_THREADS_PER_MULTIPROCESSOR = 39
        CU_DEVICE_ATTRIBUTE_CLOCK_RATE = 13
        CU_DEVICE_ATTRIBUTE_MEMORY_CLOCK_RATE = 36

        def ConvertSMVer2Cores(major, minor):
            # Returns the number of CUDA cores per multiprocessor for a given
            # Compute Capability version. There is no way to retrieve that via
            # the API, so it needs to be hard-coded.
            return {(1, 0): 8,
                    (1, 1): 8,
                    (1, 2): 8,
                    (1, 3): 8,
                    (2, 0): 32,
                    (2, 1): 48,
            }.get((major, minor), 192) # 3.0 and above

        nGpus = ctypes.c_int()
        name = b' ' * 100
        cc_major = ctypes.c_int()
        cc_minor = ctypes.c_int()
        cores = ctypes.c_int()
        threads_per_core = ctypes.c_int()
        clockrate = ctypes.c_int()
        freeMem = ctypes.c_size_t()
        totalMem = ctypes.c_size_t()

        result = ctypes.c_int()
        device = ctypes.c_int()
        context = ctypes.c_void_p()

        res = []

        if cuda.cuDeviceGetCount(ctypes.byref(nGpus)) != _CUDA_SUCCESS:
            return None

        for i in range(nGpus.value):
            dev = {}
            if cuda.cuDeviceGet(ctypes.byref(device), i) != _CUDA_SUCCESS:
                return None
            dev['id'] = i

            if cuda.cuDeviceGetName(ctypes.c_char_p(name), len(name), device) == _CUDA_SUCCESS:
                dev['name'] = name.split(b'\0', 1)[0].decode()
            if cuda.cuDeviceComputeCapability(ctypes.byref(cc_major), ctypes.byref(cc_minor), device) == _CUDA_SUCCESS:
                dev['compute_capability'] = (cc_major.value, cc_minor.value)
            if cuda.cuDeviceGetAttribute(ctypes.byref(cores), CU_DEVICE_ATTRIBUTE_MULTIPROCESSOR_COUNT, device) == _CUDA_SUCCESS:
                dev['multiprocessors'] = cores.value
                dev['cuda_cores'] = cores.value * ConvertSMVer2Cores(cc_major.value, cc_minor.value)
                if cuda.cuDeviceGetAttribute(ctypes.byref(threads_per_core), CU_DEVICE_ATTRIBUTE_MAX_THREADS_PER_MULTIPROCESSOR, device) == _CUDA_SUCCESS:
                    dev['concurrent_threads'] = (cores.value * threads_per_core.value)
            if cuda.cuDeviceGetAttribute(ctypes.byref(clockrate), CU_DEVICE_ATTRIBUTE_CLOCK_RATE, device) == _CUDA_SUCCESS:
                dev['gpu_clock_mhz'] = clockrate.value / 1000.
            if cuda.cuDeviceGetAttribute(ctypes.byref(clockrate), CU_DEVICE_ATTRIBUTE_MEMORY_CLOCK_RATE, device) == _CUDA_SUCCESS:
                dev['memory_clock_mhz'] = clockrate.value / 1000.
            result = cuda.cuCtxCreate(ctypes.byref(context), 0, device)
            if result != _CUDA_SUCCESS:
                return None
            else:
                try:
                    if cuda.cuMemGetInfo(ctypes.byref(freeMem), ctypes.byref(totalMem)) == _CUDA_SUCCESS:
                        dev['total_memory_mib'] = totalMem.value / 1024**2
                        dev['free_memory_mib'] = freeMem.value / 1024**2
                    else:
                        return None
                finally:
                    cuda.cuCtxDetach(context)
            res.append(dev)
        return res

    @staticmethod
    def devices_info():
        res = []
        devices = CudaLibrary.devices()
        for device in devices:
            buffer = io.StringIO()
            print("Device ID:            ", device['id'], file=buffer)
            if 'name' in device:
                print("Device Name:          ", device['name'], file=buffer)
            if 'compute_capability' in device:
                print("Compute Capability:   ", "%d.%d" % device['compute_capability'], file=buffer)
            if 'multiprocessors' in device:
                print("Multiprocessors:      ", device['multiprocessors'], file=buffer)
            if 'cuda_cores' in device:
                print("CUDA Cores:           ", device['cuda_cores'], file=buffer)
            if 'concurrent_threads' in device:
                print("Concurrent Threads:   ", device['concurrent_threads'], file=buffer)
            if 'gpu_clock_mhz' in device:
                print("GPU Clock:            ", "%g MHz" % device['gpu_clock_mhz'], file=buffer)
            if 'memory_clock_mhz' in device:
                print("Memory Clock:         ", "%g MHz" % device['memory_clock_mhz'], file=buffer)
            if 'total_memory_mib' in device:
                print("Total Memory:         ", "%ld MiB" % device['total_memory_mib'], file=buffer)
            if 'free_memory_mib' in device:
                print("Free Memory:          ", "%ld MiB" % device['free_memory_mib'], file=buffer)
            res.append(buffer.getvalue())
        return res

    @staticmethod
    def setup(env):
        pass

    # Code from:
    # https://gist.github.com/f0k/63a664160d016a491b2cbea15913d549

    @staticmethod
    def _setup_cuda_object():
        global _CUDA_OBJECT
        global _HAS_CUDA

        libnames = ('libcuda.so', 'libcuda.dylib', 'nvcuda.dll')
        for libname in libnames:
            try:
                cuda = ctypes.CDLL(libname)
                if cuda.cuInit(0) == _CUDA_SUCCESS:
                    _CUDA_OBJECT = cuda
                    _HAS_CUDA = True
                else:
                    _CUDA_OBJECT = None
                    _HAS_CUDA = False
            except OSError:
                continue
            else:
                break
        else:
            _CUDA_OBJECT = None
            _HAS_CUDA = False


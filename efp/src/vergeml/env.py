"""Environment and related classes.
"""

import os.path
import datetime
import time
import inspect
import csv
from copy import deepcopy

import yaml
import numpy as np

from vergeml.utils import VergeMLError, did_you_mean, parse_split
from vergeml.utils import dict_get_path, dict_set_path

from vergeml.plugins import PLUGINS
from vergeml.data import Data, Labels
from vergeml.random_robot import random_robot_name, ascii_robot
from vergeml.libraries import KerasLibrary, TensorFlowLibrary, TorchLibrary
from vergeml.libraries import NumPyLibrary, PythonInterpreter
from vergeml.display import DISPLAY, TrainingFeedback
from vergeml.config import yaml_find_definition, display_err_in_file, load_yaml_file
from vergeml.config import parse_data, parse_device


# Represent labels as list
yaml.add_representer(Labels, lambda dump, dat: dump.represent_list(dat))

# Do not use aliases.
yaml.Dumper.ignore_aliases = lambda *_args: True

ENV = None

_DEFAULT_STATS = [dict(name='acc', title='Accuracy', category="TRAINING", format='.4f',
                       smooth=True, log=True),
                  dict(name='loss', title='Loss', category="TRAINING", format='.4f',
                       smooth=True, log=True),
                  dict(name='val-acc', title='Accuracy', category="VALIDATION", format='.4f',
                       smooth=False, log=True),
                  dict(name='val-loss', title='Loss', category="VALIDATION", format='.4f',
                       smooth=False, log=True),
                  dict(name='test-acc', title='Accuracy', category="TESTING", format='.4f',
                       smooth=False, log=False),
                  dict(name='test-loss', title='Loss', category="TESTING", format='.4f',
                       smooth=False, log=False),]

class Environment:

    _current_command = None

    @property
    def current_command(self):
        """The name of the currently executing command"""
        return self._current_command

    @current_command.setter
    def current_command(self, current_command):
        self._current_command = current_command

    def __init__(self, # pylint: disable=R0913,R0914
                 model=None,
                 project_file=None,
                 samples_dir=None,
                 test_split=None,
                 val_split=None,
                 cache_dir=None,
                 random_seed=None,
                 trainings_dir=None,
                 project_dir=None,
                 cache=None,
                 device=None,
                 device_memory=None,
                 trained_model=None,
                 is_global_instance=False,
                 # config=None,
                 plugins=PLUGINS,
                 display=DISPLAY):
        """Configure, train and save the results.

        :param model:           Name of the model plugin.
        :param project_file:    Optional path to the project file.
        :param samples_dir:     The directory where samples can be found. [default: samples]
        :param test_split:      The test split. [default: 10%]
        :param val_split:       The val split. [default: 10%]
        :param cache_dir:       The directory used for caching [default: .cache]
        :param random_seed:     Random seed. [default 42]
        :param trainings_dir:   The directory to save training results to. [default: trainings]
        :param project_dir:     The directory of the project. [default: current directory]
        :param trained_model:   Optional name of a trained model.
        :is_global_instance:    If true, this env can be accessed under the global var env.ENV.
                                [default: false]
        :config:                Additional configuration to pass to env, i.e. if not using a project
                                file.
        """

        super().__init__()

        # when called from the command line, we need to have a global instance
        if is_global_instance:
            global ENV # pylint: disable=W0603
            ENV = self

        # setup the display
        self.display = display

        # set the name of the trained model if given
        self.trained_model = trained_model

        # this holds the model object (not the name of the model)
        self.model_plugin = None
        # The results class (responsible for updating data.yaml with the latest results
        # during training)
        self.results = None
        # When a training is started, this holds the object responsible for coordinating the
        # training.
        self.training = None
        # Hold a proxy to the data loader.
        self._data = None

        self.plugins = plugins

        # Set up the base options from constructor arguments.
        self._config = {
            'samples-dir': samples_dir,
            'test-split': test_split,
            'val-split': val_split,
            'cache-dir': cache_dir,
            'random-seed': random_seed,
            'trainings-dir': trainings_dir,
            'model': model
        }

        # merge project file
        if project_file:
            doc = self._load_yaml_and_configure(project_file, 'project file',
                                                cache, device, device_memory)

            # the project file DOES NOT override values passed to the environment
            for k, val in doc.items():

                if not k in self._config or self._config[k] is None:
                    self._config[k] = val

        # after the project file is loaded, fill missing values
        project_dir = project_dir or ''
        defaults = {
            'samples-dir': os.path.join(project_dir, "samples"),
            'test-split': '10%',
            'val-split': '10%',
            'cache-dir': os.path.join(project_dir, ".cache"),
            'random-seed': 42,
            'trainings-dir': os.path.join(project_dir, "trainings"),
        }

        for k, val in defaults.items():
            if self._config[k] is None:
                self._config[k] = val

        self._validate_split(project_dir)

        # Have the data_file variable in outer scope for later when reporting errors
        data_file = None

        if self.trained_model:
            data_file = self._load_trained_model()

        self._load_model_plugin(project_file, data_file, model is not None)

        # always set up numpy and python
        self.configure('python')
        self.configure('numpy')

    def _validate_split(self, project_dir):
        """Validate the split configuration for val and test.
        """

        for split in ('val-split', 'test-split'):
            spltype, splval = parse_split(self._config[split])

            if spltype == 'dir':

                # deal with relative paths
                path = os.path.join(project_dir, splval) if not os.path.isabs(splval) else splval

                if not os.path.exists(path):

                    # raise if path does not exist
                    msg = f"Invalid value for option {split} - no such directory: {splval}"
                    suggestion = f"Please set {split} to a percentage, number or directory."

                    raise VergeMLError(msg, suggestion,
                                       hint_key=split, hint_type='value', help_topic='split')

    def _load_trained_model(self):
        """Load a trained models hyperparameters and results
        """

        train_mod_path = os.path.join(self._config['trainings-dir'], self.trained_model)
        if not os.path.exists(train_mod_path):
            raise VergeMLError("Trained model not found: {}".format(self.trained_model))

        # Merge data.yaml
        data_file = os.path.join(self._config['trainings-dir'], self.trained_model, 'data.yaml')
        if not os.path.exists(data_file):
            raise VergeMLError("data.yaml file not found for {}: {}".format(
                self.trained_model, data_file))

        doc = load_yaml_file(data_file, 'data file')
        self._config.update({
            'hyperparameters': doc.get('hyperparameters', {}),
            'results': doc.get('results', {}),
            'model': doc.get('model')
        })

        self.results = _Results(self, data_file)

        return data_file

    def _load_model_plugin(self, project_file, data_file, model_via_flag):
        if self._config['model']:
            # load the model plugin
            modelname = self._config['model']
            self.model_plugin = self.plugins.get("vergeml.model", modelname)

            if not self.model_plugin:
                message = f"Unknown model name '{modelname}'"
                suggestion = (did_you_mean(self.plugins.keys('vergeml.model'), modelname)
                              or "See 'ml help models'.")

                global ENV # pylint: disable=W0603

                # if model was passed in via --model
                if model_via_flag and ENV == self:
                    message = f"Invalid value for option --model: {message}"
                else:
                    res = None
                    if data_file:
                        # first check if model was defined in the data file
                        res = _check_definition(data_file, 'model', 'value')
                    if not res and project_file:
                        # next check the project file
                        res = _check_definition(project_file, 'model', 'value')
                    if res:
                        filename, definition = res
                        line, column, length = definition
                        # display a nice error message
                        message = display_err_in_file(filename, line, column,
                                                      f"{message} {suggestion}", length)
                        # set suggestion to None since it is now contained in message
                        suggestion = None

                raise VergeMLError(message, suggestion)
            else:
                # instantiate the model plugin
                self.model_plugin = self.model_plugin(modelname, self.plugins)

    def _load_yaml_and_configure(self, path, label, cache, device, device_memory): # pylint: disable=R0913
        doc = load_yaml_file(path, label)
        try:
            doc['device'] = parse_device(doc.get('device', {}),
                                         device_id=device,
                                         device_memory=device_memory)

            doc['data'] = parse_data(doc.get('data', {}), cache=cache, plugins=self.plugins)

            if 'random-seed' in doc and not isinstance(doc['random-seed'], int):
                raise VergeMLError('Invalid value option random-seed.',
                                   'random-seed must be an integer value.',
                                   hint_type='value',
                                   hint_key='random-seed')
        except VergeMLError as err:

            if err.hint_key:

                with open(path) as file:
                    definition = yaml_find_definition(file, err.hint_key, err.hint_type)

                if definition:
                    line, column, length = definition
                    err.message = display_err_in_file(path, line, column, str(err), length)
                    # clear suggestion because it is already contained in the error message.
                    err.suggestion = None
                    raise err
                else:
                    raise err
            else:
                raise err
        return doc

    def get(self, path):
        """Get a value by its path.

        For example, to access the variable 'id' in the dict 'device', use device.id as path.
        """
        return deepcopy(dict_get_path(self._config, path, None))

    def set(self, path, value):
        """Set a value by its path.
        """
        dict_set_path(self._config, path, value)

    def samples_dir(self):
        """Return the samples_dir or throw an error if it does not exist.
        """
        samples_dir = self._config['samples-dir']
        if not os.path.exists(samples_dir):
            raise VergeMLError(f'Could not find samples directory: {samples_dir}')
        elif not os.path.isdir(samples_dir):
            raise VergeMLError(f'Configured samples-dir is not a directory: {samples_dir}')
        return samples_dir

    def trained_model_dir(self):
        """Return the directory of a trained model (create if it does not exist).
        """
        assert self.trained_model, "You must create a trained model first."
        trained_model_dir = os.path.join(self._config['trainings-dir'], self.trained_model)
        try:
            os.makedirs(trained_model_dir)
        except FileExistsError:
            pass
        return trained_model_dir

    def checkpoints_dir(self):
        """Return the checkpoints directory (create if it does not exist)
        """
        checkpoints_dir = os.path.join(self.trained_model_dir(), "checkpoints")
        try:
            os.makedirs(checkpoints_dir)
        except FileExistsError:
            pass
        return checkpoints_dir

    def stats_dir(self):
        """Return the stats directory (create if it does not exist)
        """
        stats_dir = os.path.join(self.trained_model_dir(), "stats")
        try:
            os.makedirs(stats_dir)
        except FileExistsError:
            pass
        return stats_dir

    def cache_dir(self):
        """Return the cache directory (create if it does not exist)
        """
        cache_dir = self.get("cache-dir")
        try:
            os.makedirs(cache_dir)
        except FileExistsError:
            pass
        return cache_dir

    # save_max, min needed?
    def start_training(self,
                       name=None,
                       hyperparameters={}):
        """Start a training session.

        :param name: The name of the trained model to create
        :param hyperparameters: Pass in a models fixed parameters so they can be recovered later.
        """
        created = datetime.datetime.now()
        self.trained_model = name or random_robot_name(created, self._config['trainings-dir'])

        self.display.print("Creating @{} ...".format(self.trained_model))
        robot = ascii_robot(created, self.trained_model)
        if "VERGEML_FUNKY_ROBOTS" in os.environ:
            self.display.print("")
            self.display.print(robot)
            self.display.print("")
        else:
            self.display.print("")

        results = {'created-at': time.mktime(created.timetuple())}
        if self.get('data.input.type'):
            results['num-samples'] = self.data.num_samples('train')

        self.set('hyperparameters', hyperparameters)
        self.set('random-robot', robot)
        self.set('results', results)

        data_file = os.path.join(self.trained_model_dir(), "data.yaml")

        self.results = _Results(self, data_file)
        # results will do the rest. As results periodically updates data.yaml,
        # it will save hyperparameters too
        self.results.add({'status': "RUNNING", 'training-start': time.time()})
        self.results.flush()
        # create the training object
        stats_file = os.path.join(self.stats_dir(), "stats.csv")
        self.training = Training(self, stats_file)

        # save the original configuration
        config_file = os.path.join(self.trained_model_dir(), "vergeml.yaml")
        config = deepcopy(self._config)

        del config['hyperparameters']
        del config['results']
        del config['random-robot']

        if self.current_command:
            cmd, args = self.current_command
            config[cmd.name] = args

        with open(config_file, "w") as file:
            yaml.dump(config, file, default_flow_style=False)

        return self.trained_model

    def end_training(self, final_results={}):
        """End a training session.

        :param final_results: The final results of the training. This may include test accuracy, or the
                              final accuracy values if you save the best performing epoch.
        """
        assert self.training, "Must call start_training() first."
        final_results = deepcopy({k.replace('_', '-'):v for k, v in final_results.items()})
        self.results.add(final_results)
        self.results.add({'status': "FINISHED", 'training_end': time.time()})
        self.results.flush()
        self.training.update(write_stats=False, **final_results)
        self.training.end()
        self.training = None

    def cancel_training(self):
        """Cancel a training session.
        """
        assert self.training, "Must call start_training() first."
        self.results.add({'status': "CANCELED", 'training-end': time.time()})
        self.results.flush()
        self.training.end()
        self.training = None

    @property
    def data(self):
        """Return the data loader.
        """
        if not self._data:
            self._data = Data(self, plugins=self.plugins)
        return self._data

    def configure(self, *libraries):
        """Configure various libraries by setting up random seeds etc.

        :param libraries: The libraries to configure.
        """
        for library in libraries:
            assert library in ('keras', 'tensorflow', 'numpy', 'python', 'torch')
            if library == 'keras':
                KerasLibrary.setup(self)
            elif library == 'tensorflow':
                TensorFlowLibrary.setup(self)
            elif library == 'numpy':
                NumPyLibrary.setup(self)
            elif library == 'python':
                PythonInterpreter.setup(self)
            elif library == 'torch':
                TorchLibrary.setup(self)

    def progress_callback(self,
                          epochs=None,
                          steps=None,
                          display_progress='epochs-steps',
                          stats=_DEFAULT_STATS):
        """Get a generic callback to capture training progress.
        """
        assert self.training, "Must call start_training() before calling progress_callback()"
        assert display_progress in ('epochs', 'steps', 'epochs-steps', None)
        stats = deepcopy(stats)
        return self.training.callback(epochs, steps, display_progress, stats)

    def keras_callback(self,
                       display_progress='epochs-steps',
                       stats=_DEFAULT_STATS):
        """Get a callback suitable for passing to keras to get training feedback.
        """
        assert self.training, "Must call start_training() before calling keras_callback()"
        return KerasLibrary.callback(self, display_progress, stats)

    def tensorflow_session(self):
        """Create a new tensorflow session as configured in the environment.
        """
        return TensorFlowLibrary.create_session(self)

    def args_for(self, fn, args):
        """A utility function to return only the args which can be passed to function fn.

        Also adds base values from env, like random-seed and stats-dir
        """
        args = {k.replace("-", "_"):v for k, v in args.items()}
        res = {}
        params = inspect.signature(fn).parameters.keys()
        methods = {
            'stats_dir': self.stats_dir,
            'checkpoints_dir': self.checkpoints_dir,
            'samples_dir': self.samples_dir,
            'tensorflow_session': self.tensorflow_session,
            'trained_model_dir': self.trained_model_dir,
            'trained_model': lambda: self.trained_model,
            'test_split': lambda: self.get('test-split'),
            'val_split': lambda: self.get('val-split'),
            'cache_dir': self.cache_dir(),
            'random_seed': lambda: self.get('random-seed'),
            'trainings_dir': lambda: self.get('trainings-dir'),
        }
        for param in params:
            if param in args:
                res[param] = args[param]
            elif param in methods:
                res[param] = methods[param]()
        return res

    def set_defaults(self, cmd, args):
        """Set up environment defaults before executing the command.
        """
        if self.model_plugin:
            self.model_plugin.set_defaults(cmd, args, self)
            self._config['device'] = parse_device(self._config.get('device', {}))
            self._config['data'] = parse_data(self._config.get('data', {}))




def _check_definition(filename, key, kind):
    if not filename:
        return None
    with open(filename) as f:
        definition = yaml_find_definition(f, key, kind)
        return (definition, filename) if definition else None

_SYNC_INTV = 1.0 # sync interval in seconds
class _Results:
    def __init__(self, env, path):
        self.path = path
        self.env = env
        self.last_sync = None

    def add(self, data):
        for k, v in data.items():
            self.env.set('results.' + k.replace('_', '-'), v)
        self._sync()

    def flush(self):
        self._sync(force=True)

    def _sync(self, force=False):
        now = datetime.datetime.now()
        if force or not self.last_sync or (now - self.last_sync).total_seconds() > _SYNC_INTV:
            self.last_sync = now
            data = dict(model=self.env.get('model'),
                        hyperparameters=self._convert(self.env.get('hyperparameters')),
                        results=self._convert(self.env.get('results')))
            with open(self.path, "w") as f:
                yaml.dump(data, f, default_flow_style=False)

    def _convert(self, vals):
        res = {}
        for k, v in vals.items():
            if isinstance(v, (np.int, np.int8, np.int16, np.int32, np.int64)):
                v = int(v)
            elif isinstance(v, (np.float, np.float16, np.float32, np.float64)):
                v = float(v)
            elif isinstance(v, Labels):
                v = list(v)
            elif isinstance(v, np.ndarray):
                v = v.tolist()
            elif isinstance(v, dict):
                v = self._convert(v)
            res[k] = v
        return res

class Training:

    def __init__(self, env, stats_file):
        self.env = env
        self.steps = None
        self.epochs = None
        self.display_progress = None
        self.stats = None
        self.did_start = False
        self.training_feedback = None
        self.stats_file = stats_file
        self.stats_writer = None

    def callback(self, epochs, steps, display_progress, stats):
        self.steps = steps
        self.epochs = epochs
        self.display_progress = display_progress
        self.stats = stats
        self.current_step = 0
        self.current_epoch = 0
        self._avg = {}
        for stat in self.stats:
            if not 'title' in stat:
                stat['title'] = stat['name']
            if not 'category' in stat:
                stat['category'] = ''
            if not 'format' in stat:
                stat['format'] = "{.4f}"
            if not 'smooth' in stat:
                stat['smooth'] = False
            if not 'feedback' in stat:
                stat['feedback'] = True
            if not 'log' in stat:
                stat['log'] = True
        self.stats_writer = _StatsWriter(self.stats, self.stats_file)
        return self.update

    def update(self, epoch=None, step=None, write_stats=True, **stats):
        stats = deepcopy(stats)
        if epoch is not None:
            self.current_epoch = epoch
        if step is not None:
            self.current_step = step

        results = dict(epochs=self.current_epoch, steps=self.current_step)
        results.update(stats)
        self.env.results.add(results)

        if not self.did_start:
            if self.display_progress is not None:
                self.training_feedback = TrainingFeedback(epochs=self.epochs,
                                                          steps=self.steps,
                                                          display_progress=self.display_progress,
                                                          stats=self.stats,
                                                          display=self.env.display)
                self.training_feedback.start()
            self.did_start = True

        smooth_stats = deepcopy(stats)
        if stats:
            smooth = [stat['name'] for stat in self.stats if stat['smooth']]

            if step is not None:
                for k, v in stats.items():

                    if k in smooth:
                        self._avg.setdefault(k, [])
                        self._avg[k].append(v)
                        if len(self._avg[k]) > 10:
                            self._avg[k] = self._avg[k][-10:]
                        v = sum(self._avg[k]) / len(self._avg[k])

                    smooth_stats[k] = v
            if write_stats:
                self.stats_writer.write(epoch, step, stats)
            self.training_feedback.update(epoch=epoch, step=step, **smooth_stats)


    def end(self):
        if self.did_start:
            self.training_feedback.stop()
            self.stats_writer.end()


def _toscalar(v):
    if isinstance(v, (np.float16, np.float32, np.float64,
                      np.uint8, np.uint16, np.uint32, np.uint64,
                      np.int8, np.int16, np.int32, np.int64)):
        return np.asscalar(v)
    else:
        return v

class _StatsWriter:

    def __init__(self, stats, stats_file):
        self.ks = [k['name'] for k in stats if k['log']]
        self.prev = {}

        if not self.ks:
            return

        self.file = open(stats_file, "w", newline='')
        self.writer = csv.writer(self.file)
        self.writer.writerow(["epoch", "step"] + self.ks)

    def write(self, epoch, step, data):
        if not self.ks:
            return

        # Make sure that keys have no underscores.
        data = {k.replace('_', '-'):v for k, v in data.items()}

        row = [epoch, step]
        for k in self.ks:
            if k in data:
                row.append(_toscalar(data[k]))
                self.prev[k] = data[k]
            elif k in self.prev:
                row.append(_toscalar(self.prev[k]))
            else:
                row.append(None)

        self.writer.writerow(row)

    def end(self):
        if not self.ks:
            return

        self.file.flush()
        self.file.close()
        self.writer = None
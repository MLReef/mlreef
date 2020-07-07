from vergeml.utils import parse_split, VergeMLError
import random
from typing import Optional, Any, List, Tuple
import hashlib
import glob
import os
import os.path
import json
from operator import methodcaller
import io
from vergeml.option import Option
from vergeml.plugins import PLUGINS
from copy import deepcopy
from functools import reduce


class Sample:
    """The datastructure used for loading and manipulating samples"""

    def __init__(self, x: Any, y: Any, meta: dict, rng: Optional[random.Random]):
        """
        :param x: the sample data
        :param y: the ground truth
        :param meta: sample metadata, i.e. the split, the source filename
        :param rng: a per sample random generator
        """
        self.x = x
        self.y = y
        self.meta = meta
        self.rng = rng

class SourcePlugin:
    """The base class for getting sample data.

    Whenever you request data from vergeml.Data.load(), it will use a subclass of
    SourcePlugin in the background and call its read_sample() and num_samples() methods.

    ```SourcePlugin``` takes a number of configuration parameters and sets up default values in case they are missing:

    | Parameter          | Default       | YAML               | Command Line   |
    | ------------------ | ------------- | ------------------ | -------------- |
    | samples_dir        | samples       | samples-dir        | --samples-dir  |
    | cache_dir          | .cache        | cache-dir          | --cache-dir    |
    | random_seed        | 42            | random-seed        | --random-seed  |
    | trainings_dir      | ./trainings   | N/A                | N/A            |
    | val_dir            | None          | val-split  [2]     | --val          |
    | val_num            | None          | val-split  [2]     | --val          |
    | val_perc           | 10 [1]        | val-split  [2]     | --val          |
    | test_dir           | None          | test-split [2]     | --test         |
    | test_num           | None          | test-split [2]     | --test         |
    | test_perc          | 10 [1]        | test-split [2]     | --test         |
    | input_patterns     | */**          | input-patterns [3] | N/A            |

    [1] val_perc and test_perc are set to 10 only when the corresponding _dir and _val values are not set.

    [2] val-split and test-split are interpreted as follows: if the value ends with a percentage sign,
        the corresponding _perc value is set. if the value is numeric, it will set up the corresponding _num value.
        Otherwise, it is interpreted as a path.

        For example:
        val-split=10% - sets val_perc to 10
        val-split=100 - sets val_num to 100
        val-split=/data/imgs - sets val_dir to '/data/imgs'

    [3] input-patterns is available to be set in YAML file when the SourcePlugin subclass defines input_patterns
        via @source
    """


    def __init__(self, args: dict={}):
        self.meta = {}
        self.args = deepcopy(args)

        # since input-patterns can be used in many different kinds of io sources, grab it too.
        self.input_patterns = args.get('input-patterns', '**/*')
        if isinstance(self.input_patterns, str):
            self.input_patterns = self.input_patterns.split(",")
        self.samples_dir = args.get('samples-dir', 'samples')
        self.cache_dir = args.get('cache-dir', '.cache')
        self.random_seed = args.get('random-seed', 42)
        self.trainings_dir = args.get('trainings-dir', './trainings')

        self._cached_file_state = None

        spltype, splval = parse_split(args.get('val-split', '10%'))
        self.val_dir = splval if spltype == 'dir' else None
        self.val_num = splval if spltype == 'num' else None
        self.val_perc = splval if spltype == 'perc' else None

        spltype, splval = parse_split(args.get('test-split', '10%'))
        self.test_dir = splval if spltype == 'dir' else None
        self.test_num = splval if spltype == 'num' else None
        self.test_perc = splval if spltype == 'perc' else None

    def begin_read_samples(self):
        """Called when the system starts reading samples"""

    def num_samples(self, split: str) -> int:
        """Returns the total number of samples available in the split."""
        raise NotImplementedError

    def read_samples(self, split: str, index: int, n: int=1) -> Sample:
        """Read a sample.

        :param split: a split ("train", "val" or "test")
        :param index: sample index
        :param n: how many samples to read

        The job of this method is to find the sample represented by the split and
        index and return the sample."""
        raise NotImplementedError

    def read_raw_samples(self, split: str, index: int, n: int=1) -> tuple:
        """Read raw sample data.

        This is used for caching. Override this to provide a more compact representation,
        e.g. image bytes
        """
        return self.read_samples(split, index, n)

    def recover_raw_sample(self, sample) -> Sample:
        """Recover a sample from raw sample data.

        Used for caching. Recover the value from read_raw_samples
        """
        return sample

    def end_read_samples(self):
        """Called when the system is done reading samples.

        NOTE: Under some circumstances this method is never called, for example when the source
        is used with infinite iterators or when an iterator is not consumed until the end.

        TODO: is this still true?"""

    def transform(self, sample):
        """Return the sample with x and y transformed to its final form."""
        raise NotImplementedError

    def output_shape(self):
        """Return the output shape after transform or None"""
        return None

    def hash(self, state: str) -> str:
        """Generate a hash representing the current sample state.

        :param state: string capturing the current system configuration state

        This function must be overridden to generate a meaningful hash for the current
        set of input samples."""

        newstate = io.BytesIO(state.encode('utf-8'))

        for k in ('input_patterns', 'samples_dir', 'val_dir', 'val_num', 'val_perc',
                  'test_dir', 'test_num', 'test_perc', 'random_seed'):
            newstate.write(str(getattr(self, k)).encode('utf-8'))

        md5 = hashlib.md5()
        md5.update(newstate.getvalue())
        return md5.hexdigest()

    def split(self, num_samples: int):
        """Split the dataset in train, val and test sets by percentage or absolute count.

        It works by receiving the total number of samples and a configuration
        object, and calculates an array of indices per split.:

        :param num_samples: the total number of samples

        :return: a tuple of indices for (train, val, test)
        """

        val_num = int(num_samples * self.val_perc // 100) if self.val_perc else self.val_num or 0
        test_num = int(num_samples * self.test_perc // 100) if self.test_perc else self.test_num or 0

        if val_num + test_num > num_samples:
            hint_key = None
            hint_type = None

            if self.val_num:
                hint_key = 'val'
                hint_type = 'val-split'
            elif self.test_num:
                hint_key = 'val'
                hint_type = 'test-split'

            raise VergeMLError("There are not enough samples to provide the configured number for the val and test split",
                               "If you use absolute numbers for 'val-split' or 'test-split', try to lower them",
                               help_topic='split', hint_key=hint_key, hint_type=hint_type)

        rng = random.Random(self.random_seed)
        indices = rng.sample(range(num_samples), num_samples)
        val, test, train = indices[:val_num], indices[val_num:val_num + test_num], indices[val_num + test_num:]
        return train, val, test

    def scan(self, path, exclude=[]) -> List[str]:
        """Scan path for matching files.

        :param path: the path to scan
        :param exclude: a list of directories to exclude

        :return: a list of sorted filenames
        """
        res = []
        path = path.rstrip("/").rstrip("\\")
        for pat in self.input_patterns:
            res.extend(glob.glob(path + os.sep + pat, recursive=True))

        res = list(filter(lambda p: os.path.isfile(p), res))

        if exclude:
            def excluded(path):
                for e in exclude:
                    if path.startswith(e):
                        return True
                return False

            res = list(filter(lambda p: not excluded(p), res))

        return sorted(res)

    def scan_dirs(self) -> Tuple[List[str], List[str], List[str]]:
        """Scan directories for matching files.

        :return: a tuple of files in samples_dir, val_dir, test_dir matching input_patterns
        """
        exclude = list(filter(None, (self.val_dir, self.test_dir)))
        train = self.scan(self.samples_dir, exclude)
        val = self.scan(self.val_dir) if self.val_dir else []
        test = self.scan(self.test_dir) if self.test_dir else []
        return train, val, test

    def normalize_filename(self, split, filename):
        """Return the filename without the parent samples directory
        """
        directory = self.samples_dir
        if split == 'val' and self.val_dir:
            directory = self.val_dir
        elif split == 'test' and self.test_dir:
            directory = self.test_dir

        return filename[len(directory):].strip(os.sep)


    def scan_and_split_files(self, files = None):
        """Return a dictionary of train, val and test files.
        """

        train_files, val_files, test_files = files or self.scan_dirs()

        def fromidx(idx):
            return [train_files[i] for i in idx]

        strain, sval, stest = self.split(len(train_files))

        def makemeta(split):
            return lambda filename: dict(split=split, filename=self.normalize_filename(split, filename))

        train = fromidx(strain)
        train_meta = map(makemeta('train'), train)
        val = val_files or fromidx(sval)
        val_meta = map(makemeta('val'), val)
        test = test_files or fromidx(stest)
        test_meta = map(makemeta('test'), test)

        return dict(
            train=list(zip(train, train_meta)),
            val=list(zip(val, val_meta)),
            test=list(zip(test, test_meta)))

    def hash_files(self, files):
        """A default implementation for hash based on files
        """
        if not self._cached_file_state:
            self._cached_file_state = io.BytesIO()

            for (split, files) in files.items():
                for path, _ in files:
                    fstate = "{}{}{}{}".format(split, path, os.path.getmtime(path), os.path.getsize(path))
                    self._cached_file_state.write(fstate.encode('utf-8'))

        return self._cached_file_state.getvalue().decode("utf-8")

    def options(self):
        return Option.discover(self)


    def configuration(self):
        """Return the configuration of the Source instance.

        Used for calculating the hash value when caching.
        """
        return self.args

    def supports_preview(self):
        return False

    _COUNTER = {}

    def begin_preview(self, output_dir: str):
        """Called when the system starts previewing samples"""

    def write_preview(self, output_dir: str, split: str, sample: Sample):
        raise NotImplementedError

    def end_preview(self, output_dir: str):
        """Called when the system is done previewing samples"""

    def preview_filename(self, path):
        """Generate a filename for previews, appending a number when the file already exists.
        """
        if not os.path.exists(path):
            return path

        pcounter = SourcePlugin._COUNTER
        if not path in pcounter:
            pcounter[path] = 1
        fname, ext = os.path.splitext(path)
        counter = pcounter[path]

        while os.path.exists("{}_{}{}".format(fname, counter, ext)):
            counter += 1
        pcounter[path] = counter

        return "{}_{}{}".format(fname, counter, ext)


_SOURCE_META_KEY = '__vergeml_source__'
def source(name, descr=None, long_descr=None, input_patterns=None):
    """Define a source.

    :param name:            Name of the source.
    :param descr:           A short description of the source
    :param long_descr:      A long description
    :param input_patterns:  When the source takes input patterns as argument, a single pattern
                            or a list of pattenrs. Otherwise None.
    """
    def decorator(o):
        # if getattr(o, _SOURCE_META_KEY, None):
        #     print(getattr(o, _SOURCE_META_KEY, None).name, name)
        # assert getattr(o, _SOURCE_META_KEY, None) is None

        options = Option.discover(o)
        if input_patterns:
            assert isinstance(input_patterns, (str, list))
            input_patterns_option = Option('input-patterns', input_patterns, type='Union[str, List[str]]',
                                            descr="Controls which files are loaded.",
                                            transform=lambda v: v if isinstance(v, list) else v.split(","))
            options.append(input_patterns_option)

        cmd = Source(name,
                    descr=descr,
                    long_descr=long_descr,
                    options=options)
        setattr(o, _SOURCE_META_KEY, cmd)
        return o
    return decorator

class Source:
    def __init__(self, name, descr=None, long_descr=None, options=None, plugins=PLUGINS):
        self.name = name
        self.descr = descr
        self.long_descr = long_descr
        self.options = options or []
        self.plugins = plugins

    @staticmethod
    def discover(o, plugins=PLUGINS):
        res = None
        if hasattr(o, _SOURCE_META_KEY):
            res = getattr(o, _SOURCE_META_KEY)
            res.plugins = plugins
            for option in res.options:
                option.plugins = plugins
        return res

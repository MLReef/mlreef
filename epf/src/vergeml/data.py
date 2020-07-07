"""This module contains interfaces to the underlying data loading.
"""

from typing import List, Any, Union, Callable, Optional
import random

import numpy as np

from vergeml.utils import VergeMLError
from vergeml.views import BatchView, IteratorView
from vergeml.io import SourcePlugin
from vergeml.operation import BaseOperation
from vergeml.loader import FileCachedLoader, LiveLoader, MemoryCachedLoader
from vergeml.plugins import PLUGINS
from vergeml.utils import introspect
from vergeml.display import DISPLAY
from vergeml.utils import SPLITS


class Labels(list):
    """A list of labels.
    """
    pass


class BoundingBoxes(list):
    """A list of bounding boxes.
    """
    pass


class BoundingBox: # pylint: disable=R0903
    """A bounding box defined by coordinates and size.
    """
    def __init__(self, label: str, x: int, y: int, width: int, height: int): # pylint: disable=R0913

        # pylint: disable=C0103
        self.label = label
        self.x = x
        self.y = y
        self.width = width
        self.height = height


class Data:
    """Handle loading, augmentation and caching of your sample data.

    The easiest way to set up Data is by using it from the environment
    object.

        xy_train = env.data.load()
        # xy_train is now [(x1, y1), (x2, y2), ...]

    Data will be automatically set up by the environment and ready to
    use. Alternatively, Data can be set up manually by providing input,
    output and ops.
    """

    def __init__(self, # pylint: disable=R0913
                 env: 'Environment' = None,
                 input: SourcePlugin = None, # pylint: disable=W0622
                 output: SourcePlugin = None,
                 ops: List[BaseOperation] = None,
                 random_seed: int = 42,
                 cache_dir: str = '.cache',
                 cache_input: Union[str, bool] = 'mem',
                 cache_output: Union[str, bool] = False,
                 plugins=PLUGINS):

        """For automatic configuration, pass in an env object. To
        manually setup the data class, you need to provide the
        input (a SourcePlugin object).

        :param env: an Environment object used to set up Data. If an
                    environment is provided, other options are ignored.

        :param input: the input (SourcePlugin)

        :param output: the output (SourcePlugin)

        :param ops: a list of preprocessing operations (BaseOperation)

        :param random_seed: the random seed to use

        :param cache_input: config of input caching, default: False.
                            possible values: 'mem', 'disk' or False

        :param cache_output: config of output caching, default: 'disk'
        """

        self.cache_dir = cache_dir
        self.env = env
        self.input = input

        # output defaults to input
        self.output = output or input
        self.ops = (ops or []).copy()

        self.random_seed = random_seed
        self.cache_input = cache_input
        self.cache_output = cache_output

        self.plugins = plugins
        self.loader = None
        self._progress_bar = None


        if env:
            # When we are provided with an environment, set everything
            # up according to the environment's configuration.
            self._setup_from_env()
        else:

            # Sanity check
            assert cache_input in ('mem', 'disk', False)
            assert cache_output in ('mem', 'disk', False)
            assert self.input is not None

            self.loader = self._get_loader(cache_input, cache_output)

    def _get_loader(self, cache_input, cache_output):

        if cache_input in ('disk', 'mem'):

            # When doing input caching, wrap the input object in
            # a cached loader.

            loader_class = FileCachedLoader if cache_input == 'disk' else MemoryCachedLoader
            input_loader = loader_class(self.cache_dir, self.input)
            input_loader.progress_callback = self._progress_callback
        else:

            # otherwise, use the input object directly
            input_loader = self.input

        if cache_output in ('disk', 'mem'):

            # set up output caching

            loader_class = FileCachedLoader if cache_output == 'disk' else MemoryCachedLoader
            loader = loader_class(self.cache_dir, input_loader, self.ops, self.output)
            loader.progress_callback = self._progress_callback

            return loader

        return LiveLoader(self.cache_dir, input_loader, self.ops, self.output)

    @property
    def meta(self):
        """Sample metadata (e.g. labels).
        """
        self.loader.begin_read_samples()
        meta = self.loader.meta
        self.loader.end_read_samples()
        return meta

    def load(self, # pylint: disable=R0913
             split: str = 'train',
             view: str = 'list',
             layout: str = 'tuples',
             batch_size: int = 64,
             fetch_size: Optional[int] = None,
             infinite: bool = False,
             with_meta: bool = False,
             randomize: bool = False,
             transform_x: Callable[[Any], Any] = lambda x: x,
             transform_y: Callable[[Any], Any] = lambda y: y):

        """
        :param split: The split to load. One of "train", "val", "test".

        :param view: How to return the data. Option are:

                    - "list" (default): reads all data into memory and
                      return it as python list or optionally as numpy
                      array (when layout is set to 'arrays').

                    - "batch": return a generator, splitting the data
                      into batches of batch_size. The returned object
                      supports getting the length (number of batches)
                      via the len() function.

                    - "iter": return the data as an **iterator** object.

        :param layout: Determines how x, y and (optionally meta) is
                       returned.
                       Can be one of:

                       - "tuples": shape the data as (x,y) pairs.

                         [(x1,y1), (x2,y2), ...]

                       - "lists": shape x,y as distinct lists [xs], [ys]

                         ([x1, x2, x3], [y1, y2, y3])

                       - "arrays": return numpy arrays [xs], [ys]

                         array([[1, 2, 3],
                                [4, 5, 6]])

        :param batch_size: Sample batch size. Applies to "batch" view
                           only. Defaults to 64.

        :param fetch_size: Fetch samples in pairs of fetch_size. None
                           means the system will automatically set a
                           fetch size.

        :param infinite: Applies to "batch" and "iter" views. If set to
                         True, the returned object will be an infinite
                         generator object.

            NOTE for KERAS users: This setting is useful when used in
            with model.fit_generator(). Since len() will return the
            number of steps per epoch, steps_per_epoch can be left
            unspecified when calling fit_generator().

        :param with_meta: If True, will return meta in addition to x
                          and y.

        :param randomize: If True, the data will be returned in random
                          order.

        :param transform_x: a function that takes x as an argument and
                            returns a transformed version.
                            Defaults to no transformation.

        :param transform_y: a function that takes x as an argument and
                            returns a transformed version.
                            Defaults to no transformation."""

        assert view in ('list', 'batch', 'iter')
        assert layout in ('tuples', 'lists', 'arrays')
        fetch_size = fetch_size or 8

        if view == 'list':
            return _load_list(loader=self.loader,
                              split=split,
                              layout=layout,
                              with_meta=with_meta,
                              randomize=randomize,
                              random_seed=self.random_seed,
                              transform_x=transform_x,
                              transform_y=transform_y)

        if view == 'batch':

            return BatchView(loader=self.loader,
                             split=split,
                             layout=layout,
                             batch_size=batch_size,
                             fetch_size=fetch_size,
                             infinite=infinite,
                             with_meta=with_meta,
                             randomize=randomize,
                             random_seed=self.random_seed,
                             transform_x=transform_x,
                             transform_y=transform_y)

        if view == 'iter':
            return IteratorView(loader=self.loader,
                                split=split,
                                fetch_size=fetch_size,
                                infinite=infinite,
                                with_meta=with_meta,
                                randomize=randomize,
                                random_seed=self.random_seed,
                                transform_x=transform_x,
                                transform_y=transform_y)


        # never runs in this code, make the linter happy
        assert False
        return None

    def _base_env_config(self):
        """Get the base configuration values from env (splits etc.)
        """
        keys = ('val-split', 'test-split', 'samples-dir', 'random-seed', 'trainings-dir')
        return {k: self.env.get(k) for k in keys}

    def _setup_input(self):
        """Set up input from env.
        """

        # get the name of the input plugin
        input_name = self.env.get('data.input.type')
        if not input_name:
            raise VergeMLError("data.input.type is not defined.")

        # get input configuration and merge base config
        input_conf = self.env.get('data.input').copy()
        input_conf.update(self._base_env_config())

        # instantiate the input plugin
        input_class = self.plugins.get('vergeml.io', input_name)
        if not input_class:
            raise VergeMLError("input name not found: {}".format(input_name))

        # TODO validate configuration and set defaults
        del input_conf['type']

        self.input = input_class(input_conf)

    def _setup_ops(self):
        """Set up ops from env.
        """

        # set up preprocessing operations
        self.ops = []

        for conf in self.env.get('data.preprocess') or []:
            if isinstance(conf, str):
                conf = dict(name=conf)
            else:
                conf = conf.copy()

            # every preprocessing operations needs a name property
            name = conf.get('op', None)
            if not name:
                raise VergeMLError("Name missing in data.preprocess item.")
            del conf['op']

            # instantiate the preprocessing plugin
            plugin = self.plugins.get('vergeml.operation', name)
            if not plugin:
                raise VergeMLError("preprocess plugin not found: {}".format(name))

            # check arguments
            intro = introspect(plugin)
            mandatory = set(intro.args[1:]).difference(set(intro.defaults.keys()))
            missing = set(mandatory).difference(conf.keys())
            unknown = set(conf.keys()).difference(intro.args[1:])

            # TODO type checking

            # report missing or unknown arguments
            if missing:
                msg = "preprocess operation {} is missing argument(s): {}"
                raise VergeMLError(msg.format(name, missing))

            if unknown:
                msg = "preprocess operation {} received unknown argument(s): {}"
                raise VergeMLError(msg.format(name, unknown))

            operation = plugin(**conf)
            self.ops.append(operation)

    def _setup_output(self):
        """Set up output from env.
        """

        # get the name of the output plugin or set it to input
        output_name = self.env.get('data.output.type') or self.env.get('data.input.type')

        # get output configuration or set it to input configuration and merge
        # with base config
        output_conf = self.env.get('data.output') or self.env.get('data.input').copy()
        output_conf['name'] = output_name
        output_conf.update(self._base_env_config())

        # instantiate the output plugin
        output_class = self.plugins.get('vergeml.io', output_name)
        if not output_class:
            raise VergeMLError("output name not found: {}".format(output_name))

        self.output = output_class(output_conf)


    def _setup_cache(self):
        """Set up caching from env.
        """

        cache = self.env.get("data.cache")
        if cache == 'mem-in':
            self.cache_input, self.cache_output = 'mem', False
        elif cache == 'disk-in':
            self.cache_input, self.cache_output = 'disk', False
        elif cache == 'mem':
            self.cache_input, self.cache_output = False, 'mem'
        elif cache in ('disk', 'auto'):
            self.cache_input, self.cache_output = False, 'disk'
        elif cache == 'none':
            self.cache_input, self.cache_output = False, False


    def _setup_from_env(self):
        """Configure using the environment object.
        """

        self.random_seed = self.env.get('random-seed')
        self.cache_dir = self.env.cache_dir()

        self._setup_input()
        self._setup_ops()
        self._setup_output()
        self._setup_cache()

        self.loader = self._get_loader(self.cache_input, self.cache_output)

    def num_samples(self, split):
        """Return the number of samples in split.
        """

        self.loader.begin_read_samples()
        res = self.loader.num_samples(split)
        self.loader.end_read_samples()
        return res

    def _progress_callback(self, current, total):
        if total:

            if current == -1:

                if self.cache_input == 'mem':
                    msg = "Caching input samples in memory ..."
                elif self.cache_output == 'mem':
                    msg = "Caching output samples in memory ..."
                elif self.cache_input == 'disk':
                    msg = "Caching input samples on disk ..."
                elif self.cache_output == 'disk':
                    msg = "Caching output samples on disk ..."
                else:
                    msg = None

                if msg:
                    DISPLAY.print(msg)
            else:
                if not self._progress_bar:
                    # start the progress bar
                    self._progress_bar = DISPLAY.progressbar(steps=total,
                                                             label="samples", keep=False)
                    self._progress_bar.start()

                self._progress_bar.update(current)

                if current + 1 == total:
                    # close the progress bar on the last step
                    self._progress_bar.stop()
                    print("")



def _load_list(loader,  # pylint: disable=R0914,R0913
               random_seed,
               split,
               transform_x,
               transform_y,
               with_meta,
               randomize,
               layout):
    # pylint: disable=C0103
    res = []
    loader.begin_read_samples()

    num_samples = loader.num_samples(split)

    for sample in loader.read_samples(split, 0, num_samples):
        x, y, m = sample.x, sample.y, sample.meta
        x, y = transform_x(x), transform_y(y)
        if with_meta:
            res.append((x, y, m))
        else:
            res.append((x, y))

    loader.end_read_samples()

    if randomize:
        random.Random(random_seed).shuffle(res)

    if layout in ('lists', 'arrays'):
        res = tuple(map(list, zip(*res)))
        if not res:
            res = ([], [], []) if with_meta else ([], [])

    if layout == 'arrays':
        xs, ys, *meta = res
        res = tuple([np.array(xs), np.array(ys)] + meta)
    return res

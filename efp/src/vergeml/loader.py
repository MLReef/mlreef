"""
A collection of classes implementing various data loading techniques.
"""

import operator
import os.path
import threading
import queue

from functools import reduce
from typing import List

from vergeml.io import Sample
from vergeml.utils import SPLITS
from vergeml.cache import MemoryCache, SerializedFileCache

class _Pump(threading.Thread):
    """Continuously perform data loading in a background thread like a
    pump.

    Pump continuously loads samples and fills up a queue, which is then
    read back by the loader. To determine which samples to read, it
    takes an infinite generator function as an argument. The generator
    returns the index and the number of samples to read next.
    Once max_items are waiting in the queue, it will pause loading
    samples.
    """

    def __init__(self, loader, split, ix_gen, max_items):
        """
        :param loader: Object responsible for loading samples.
        :param split: train, val or test.
        :param ix_gen: An infinite generator yielding tuples (ix, n).
        :param max_items: The maximum number of samples to have in the
                          queue.
        """
        super().__init__()
        self.ix_gen = ix_gen
        self.outq = queue.Queue(max_items)
        self.split = split
        self.loader = loader
        self.daemon = True


    def run(self):
        self.loader.begin_read_samples()

        while True:
            index, n_samples = next(self.ix_gen)
            samples = self.loader.perform_read(self.split, index, n_samples)

            # Blocks when the queue is full (until samples are read).
            self.outq.put((index, n_samples, samples))

    def perform_read(self, _split: str, index: int, n_samples: int = 1):
        """Read samples from the queue which were previously read in the
        background thread.

        Samples must be read in the exact order in which they were
        placed in the queue, i.e. index and n_samples must match.
        """


        # remove samples from the queue. (if there are no samples available,
        # block until the background thread puts samples in the queue)
        index_, n_samples_, samples = self.outq.get()

        # Sanity check
        assert index_ == index
        assert n_samples_ == n_samples

        return samples

    def __del__(self):
        # (try) to clean up...
        self.loader.end_read_samples()


class Loader:
    """Abstract base class for data loaders.
    """

    def __init__(self, cache_dir, input, ops=None, output=None, transform=True): # pylint: disable=W0622
        self.cache_dir = cache_dir
        self.input = input
        self.ops = ops or []
        self.output = output
        self.cache = {}
        self.pumps = {}

        self._progress_callback = lambda n, t: None

    @property
    def meta(self):
        """Metadata of the loaded samples, e.g. all labels.
        """
        return self.input.meta

    @property
    def progress_callback(self):
        """Set this callback in order to receive progress updates.
        """
        return self._progress_callback

    @progress_callback.setter
    def progress_callback(self, value):
        """Setter for progress_callback.
        """
        self._progress_callback = value


    def pump(self, split, ix_gen, max_items=100):
        """Set up the pump for a split.

        Typically used by a view to set up the pumping mechanism. This
        will start a background thread which will continuously load
        samples, also during training.

        It works by receiving a generator which provides the pump with
        the index and number of the next samples to load. When
        read_samples is called later, samples must be read in the same
        order as previously returned by the generator.
        """
        if not split in self.pumps:
            self.pumps[split] = _Pump(self, split, ix_gen, max_items)
            self.pumps[split].start()

    def begin_read_samples(self):
        """Prepare to start reading samples.
        """
        raise NotImplementedError

    def num_samples(self, split: str) -> int:
        """Get the number of samples in split.
        """
        return len(self.cache[split])

    def read_samples(self, split: str, index: int, n_samples: int = 1) -> Sample:
        """Read n_samples starting at index from the cache.
        """
        samples = []

        # either read from a pump or directly from self.
        reader = self.pumps.get(split, self)

        for item in reader.perform_read(split, index, n_samples):
            x, y = item[0] # pylint: disable=C0103

            meta, rng = item[1]
            samples.append(Sample(x, y, meta, rng))

        return samples

    def perform_read(self, split: str, index: int, n_samples: int = 1):
        """Perform the actual read operation on the cache object.
        """
        return self.cache[split].read(index, n_samples)

    def end_read_samples(self):
        """Every call to begin_read_samples is closed with end_read_samples.
        """
        pass

    def _calculate_num_samples(self, split):
        """Calculate the total number of samples after applying ops.
        """
        num_samples = self.input.num_samples(split)

        # calculate how much the samples will be augmented after going through ops
        multiplier = reduce(operator.mul, map(lambda op: _get_multiplier(split, op), self.ops), 1)

        return int(num_samples * multiplier)

    def _calculate_hashed_state(self):
        """Get a hash representing the set of samples and the configuration.
        """

        # construct a string representing input configuration
        input_conf_str = str(sorted(self.input.configuration().items()))
        state = self.input.__class__.__name__ + input_conf_str

        if self.output:
        # construct a representation of ops and output configuration
            ops_state = "-".join([str(sorted(op.configuration().items())) for op in self.ops])
            out_state = self.output.__class__.__name__ + \
                str(sorted(self.output.configuration().items()))

            # and append it to state
            state = "-".join([state, ops_state, out_state])

        # input will handle hashing the state of sample data
        return self.input.hash(state)

    def _iter_samples(self, split, raw=False):
        """Iterate samples possibly applying operations.
        """

        num_samples = self.input.num_samples(split)
        readfn = lambda i: self.input.read_samples(split, i)[0]
        opfn = lambda s: [s]
        tffn = lambda s: s

        # apply operations
        if self.ops:
            op1, *oprest = self.ops
            opfn = lambda s: op1.process(s, oprest)

        if raw and not self.output:
        # read raw samples
            readfn = lambda i: self.input.read_raw_samples(split, i)[0]
        elif self.output:
        # transform the sample to output
            tffn = self.output.transform

        for index in range(num_samples):
            sample = readfn(index)
            for sample_ in opfn(sample):
                yield tffn(sample_)


def _get_multiplier(split, operation):
    has_split = hasattr(operation, 'apply') and operation.apply.intersection(set(SPLITS))

    if has_split and split not in operation.apply:
        return 1.0

    return operation.multiplier()

class MemoryCachedLoader(Loader):
    """Load sample data into a memory cache.
    """

    def begin_read_samples(self):
        if self.cache:
            return

        self.input.begin_read_samples()

        # copy meta
        if self.output:
            self.output.meta = self.input.meta

        self.cache = {k:MemoryCache() for k in SPLITS}
        total = sum(map(self._calculate_num_samples, SPLITS))

        i = 0
        self._progress_callback(-1, total)
        for split in SPLITS:
            cache = self.cache[split]
            for sample in self._iter_samples(split):
                cache.write((sample.x, sample.y), (sample.meta, sample.rng))
                self._progress_callback(i, total)
                i = i + 1

        self.input.end_read_samples()



class FileCachedLoader(Loader):
    """Cache sample data in a file cache.
    """

    def begin_read_samples(self):
        if self.cache:
            return

        self.input.begin_read_samples()

        # copy meta
        if self.output:
            self.output.meta = self.input.meta

        hashed_state = self._calculate_hashed_state()

        paths = [(split, self._cache_path(split, hashed_state)) for split in SPLITS]

        # get the total number of samples
        total = sum([self._calculate_num_samples(s) for s, p in paths
                     if not os.path.exists(p)])

        if total:
            i, cache = 0, None

            try:
                self._progress_callback(-1, total)

                for split, path in paths:
                    if not os.path.exists(path):
                        # we compress output data since its likely to be numpy arrays
                        cache = SerializedFileCache(path, "w", compress=bool(self.output))

                        for sample in self._iter_samples(split, raw=True):
                            cache.write((sample.x, sample.y), (sample.meta, sample.rng))
                            self._progress_callback(i, total)
                            i += 1
                        cache.close()

                        cache = None
            except (KeyboardInterrupt, SystemExit, Exception) as exc:
                # clean up in case of an exception

                # first, in case there is an open cache, close it
                if cache:
                    cache.close()

                # then, delete all cached files
                for _, path in paths:
                    if os.path.exists(path):
                        try:
                            os.unlink(path)
                        except: # pylint: disable=W0702
                            pass

                raise exc

        compress = bool(self.output)
        self.cache = {split:SerializedFileCache(path, "r", compress=compress)
                      for split, path in paths}
        self.input.end_read_samples()



    def read_samples(self, split: str, index: int, n_samples: int = 1) -> List[Sample]:
        samples = super().read_samples(split, index, n_samples)
        if not self.output:
            samples = [self.input.recover_raw_sample(sample) for sample in samples]
        return samples

    def _cache_path(self, split, hashed_state):
        return os.path.join(self.cache_dir, "{}-{}.cache".format(hashed_state, split))


class LiveLoader(Loader):
    """Load live sample data without caching.
    """

    multipliers = None
    rngs = None
    transform = True

    def begin_read_samples(self):
        if self.cache:
            return

        self.input.begin_read_samples()
         # copy meta
        if self.output:
            self.output.meta = self.input.meta

        self.multipliers = {}
        self.rngs = {}

        def _mul(split):
            return reduce(operator.mul, map(lambda op: _get_multiplier(split, op), self.ops), 1)

        for split in SPLITS:
            self.multipliers[split] = _mul(split)
            self.cache[split] = self._calculate_num_samples(split)
            self.rngs[split] = self.cache[split] * [None]

        self.input.end_read_samples()



    def num_samples(self, split: str) -> int:
        return self.cache[split]

    def perform_read(self, split: str, index: int, n_samples: int = 1): # pylint: disable=R0914

        mul = self.multipliers[split]
        offset = int(index % mul)
        start_index = int(index/mul)
        end_index = int((index+n_samples)/mul)
        read = max(1, int(n_samples/mul) + int(min(1, index%mul)))

        res = []

        samples = self.input.read_samples(split, start_index, read)
        if self.output and self.ops:
            op1, *oprest = self.ops

            for sample in samples:
                res.extend(op1.process(sample, oprest))

        else:
            res = samples

        if self.output and self.transform:
            res = [self.output.transform(sample) for sample in res]

        for sample, i in zip(res, range(start_index, end_index)):
            if self.rngs[split][i] is None:
                self.rngs[split][i] = sample.rng
            else:
                sample.rng = self.rngs[split][i]

        res = res[offset: offset+n_samples]

        return list(map(lambda s: ((s.x, s.y), (s.meta, s.rng)), res))

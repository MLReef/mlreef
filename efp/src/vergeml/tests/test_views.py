"""
Tests views.
"""

import random
import itertools

from vergeml.views import IteratorView
from vergeml.loader import LiveLoader
from vergeml.io import SourcePlugin, source, Sample

# pylint: disable=C0111

def test_iterview_default():
    loader = LiveLoader('.cache', SourceTest())
    iterview = IteratorView(loader, 'train')
    assert list(map(lambda tp: tp[0], iterview)) == list(range(100))

def test_iterview_infinite():
    loader = LiveLoader('.cache', SourceTest())
    iterview = IteratorView(loader, 'train', infinite=True)
    assert list(map(lambda tp: tp[0], itertools.islice(iterview, 150))) \
        == list(range(100)) + list(range(50))

def test_iterview_random():
    loader = LiveLoader('.cache', SourceTest())
    iterview = IteratorView(loader, 'train', randomize=True, fetch_size=1)
    assert list(map(lambda tp: tp[0], itertools.islice(iterview, 10))) \
        == [92, 1, 43, 61, 35, 73, 48, 18, 98, 36]

def test_iterview_random_fetch_size():
    loader = LiveLoader('.cache', SourceTest())
    iterview = IteratorView(loader, 'train', randomize=True, fetch_size=10)
    assert list(map(lambda tp: tp[0], itertools.islice(iterview, 10))) \
        == list(range(70, 80))

def test_iterview_transform():
    loader = LiveLoader('.cache', SourceTest())
    iterview = IteratorView(loader, 'train', transform_x=lambda x: x + 10)
    assert list(map(lambda tp: tp[0], iterview)) == list(range(10, 110))

def test_iterview_meta():
    loader = LiveLoader('.cache', SourceTest())
    iterview = IteratorView(loader, 'train', with_meta=True)
    assert next(iterview) == (0, 5, dict(meta=0))
    assert next(iterview) == (1, 6, dict(meta=1))
    assert next(iterview) == (2, 7, dict(meta=2))

def test_iterview_transform_y():
    loader = LiveLoader('.cache', SourceTest())
    iterview = IteratorView(loader, 'train', transform_y=lambda _: 'transformed_y')
    assert next(iterview)[1] == 'transformed_y'

def test_iterview_val():
    loader = LiveLoader('.cache', SourceTest())
    iterview = IteratorView(loader, 'val')
    assert list(map(lambda tp: tp[0], iterview)) == list(range(10))

def test_iterview_test():
    loader = LiveLoader('.cache', SourceTest())
    iterview = IteratorView(loader, 'test')
    assert list(map(lambda tp: tp[0], iterview)) == list(range(20))

def test_iterview_random2():
    loader = LiveLoader('.cache', SourceTest())
    iterview = IteratorView(loader, 'train', randomize=True, fetch_size=1)
    iterview2 = IteratorView(loader, 'train', randomize=True, random_seed=2601, fetch_size=1)
    assert list(map(lambda tp: tp[0], itertools.islice(iterview2, 10))) \
        != list(map(lambda tp: tp[0], itertools.islice(iterview, 10)))


@source('test-source', 'A test source.') # pylint: disable=W0223
class SourceTest(SourcePlugin):

    def __init__(self, args=None):
        self.data = dict(
            train=list(range(100)),
            val=list(range(10)),
            test=list(range(20))
        )
        super().__init__(args or {})

    def num_samples(self, split: str) -> int:
        return len(self.data[split])

    def read_samples(self, split, index, n=1):
        items = self.data[split][index: index+n]
        return [Sample(item, item+5, {'meta': item}, random.Random(self.random_seed + item))
                for item in items]

"""
Test the data loading interface.
"""

import random
from pathlib import Path

from vergeml.data import Data
from vergeml.io import source, SourcePlugin, Sample
from vergeml.operation import operation, OperationPlugin
from vergeml.operations.augment import AugmentOperation

# pylint: disable=C0111

# -------------------------------------------------

def test_data_live_loader_meta(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    data = Data(input=src, cache_dir=cache_dir, cache_input=False)
    _test_data_meta(data)

def test_data_mem_loader_meta(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    data = Data(input=src, cache_dir=cache_dir, cache_input='mem')
    _test_data_meta(data)

def test_data_disk_loader_meta(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    data = Data(input=src, cache_dir=cache_dir, cache_input='disk')
    _test_data_meta(data)

# -------------------------------------------------

def test_data_live_loader_with_ops_meta(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    data = Data(input=src, cache_dir=cache_dir, ops=[AppendStringOperation()],
                cache_input=False, cache_output=False)
    _test_data_meta(data)

def test_data_mem_out_loader_with_ops_meta(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    data = Data(input=src, cache_dir=cache_dir, ops=[AppendStringOperation()],
                cache_input=False, cache_output='mem')
    _test_data_meta(data)

def test_data_disk_out_loader_with_ops_meta(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    data = Data(input=src, cache_dir=cache_dir, ops=[AppendStringOperation()],
                cache_input=False, cache_output='disk')
    _test_data_meta(data)

def test_data_mem_loader_with_ops_meta(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    data = Data(input=src, cache_dir=cache_dir, ops=[AppendStringOperation()],
                cache_input='mem', cache_output=False)
    _test_data_meta(data)

def test_data_disk_loader_with_ops_meta(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    data = Data(input=src, cache_dir=cache_dir, ops=[AppendStringOperation()],
                cache_input='disk', cache_output=False)
    _test_data_meta(data)

# -------------------------------------------------

def test_data_live_loader_num_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    data = Data(input=src, cache_dir=cache_dir, cache_input=False)
    _test_data_num_samples(data)

def test_data_mem_loader_num_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    data = Data(input=src, cache_dir=cache_dir, cache_input='mem')
    _test_data_num_samples(data)

def test_data_disk_loader_num_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    data = Data(input=src, cache_dir=cache_dir, cache_input='disk')
    _test_data_num_samples(data)

# -------------------------------------------------

def test_data_live_loader_ops_num_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    data = Data(input=src, cache_dir=cache_dir, ops=[AppendStringOperation()],
                cache_input=False, cache_output=False)
    _test_data_num_samples(data)

def test_data_mem_out_loader_ops_num_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    data = Data(input=src, cache_dir=cache_dir, ops=[AppendStringOperation()],
                cache_input=False, cache_output='mem')
    _test_data_num_samples(data)

def test_data_disk_out_loader_ops_num_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    data = Data(input=src, cache_dir=cache_dir, ops=[AppendStringOperation()],
                cache_input=False, cache_output='disk')
    _test_data_num_samples(data)

def test_data_mem_loader_ops_num_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    data = Data(input=src, cache_dir=cache_dir, ops=[AppendStringOperation()],
                cache_input='mem', cache_output=False)
    _test_data_num_samples(data)

def test_data_disk_loader_ops_num_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    data = Data(input=src, cache_dir=cache_dir, ops=[AppendStringOperation()],
                cache_input='disk', cache_output=False)
    _test_data_num_samples(data)

# -------------------------------------------------

def test_data_mem_loader_read_samples(tmpdir):
    # TEST THIS!
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, cache_input='mem', cache_output=False)
    _test_data_read_samples(data)

def test_data_live_loader_read_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, cache_input=False, cache_output=False)
    _test_data_read_samples(data)

def test_data_disk_loader_read_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, cache_input='disk', cache_output=False)
    _test_data_read_samples(data)

# --------------------------------------------------

def test_data_live_loader_with_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, ops=[AppendStringOperation()],
                cache_input=False, cache_output=False)
    _test_data_read_samples_transformed(data)

def test_data_mem_loader_with_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, ops=[AppendStringOperation()],
                cache_input='mem', cache_output=False)
    _test_data_read_samples_transformed(data)

def test_data_mem_out_loader_with_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, ops=[AppendStringOperation()],
                cache_input=False, cache_output='mem')
    _test_data_read_samples_transformed(data)

def test_data_disk_loader_with_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, ops=[AppendStringOperation()],
                cache_input='disk', cache_output=False)
    _test_data_read_samples_transformed(data)

def test_data_disk_out_loader_with_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, ops=[AppendStringOperation()],
                cache_input=False, cache_output='disk')
    _test_data_read_samples_transformed(data)

# --------------------------------------------------


def test_data_live_loader_with_multiplier_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, ops=[AugmentOperation(variants=2)],
                cache_input=False, cache_output=False)
    _test_data_read_samples_transformed_x2(data)


def test_data_mem_out_loader_with_multiplier_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, ops=[AugmentOperation(variants=2)],
                cache_input=False, cache_output='mem')
    _test_data_read_samples_transformed_x2(data)


def test_data_disk_out_loader_with_multiplier_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, ops=[AugmentOperation(variants=2)],
                cache_input=False, cache_output='disk')
    _test_data_read_samples_transformed_x2(data)


def test_data_mem_loader_with_multiplier_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, ops=[AugmentOperation(variants=2)],
                cache_input='mem', cache_output=False)
    _test_data_read_samples_transformed_x2(data)


def test_data_disk_loader_with_multiplier_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, ops=[AugmentOperation(variants=2)],
                cache_input='disk', cache_output=False)
    _test_data_read_samples_transformed_x2(data)

# --------------------------------------------------

def test_data_live_loader_with_multiplier_ops_between(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, ops=[AugmentOperation(variants=2)],
                cache_input=False, cache_output=False)
    _test_data_read_samples_x2_between(data)

def test_data_mem_out_loader_with_multiplier_ops_between(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, ops=[AugmentOperation(variants=2)],
                cache_input=False, cache_output='mem')
    _test_data_read_samples_x2_between(data)

def test_data_disk_out_loader_with_multiplier_ops_between(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, ops=[AugmentOperation(variants=2)],
                cache_input=False, cache_output='disk')
    _test_data_read_samples_x2_between(data)

def test_data_mem_loader_with_multiplier_ops_between(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, ops=[AugmentOperation(variants=2)],
                cache_input='mem', cache_output=False)
    _test_data_read_samples_x2_between(data)

def test_data_disk_loader_with_multiplier_ops_between(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    data = Data(input=src, cache_dir=cache_dir, ops=[AugmentOperation(variants=2)],
                cache_input='disk', cache_output=False)
    _test_data_read_samples_x2_between(data)

# ---------------------------------------------------------------------------------

def _test_data_meta(data):
    assert data.meta['some-meta'] == 'meta-value'

def _test_data_num_samples(data):
    assert data.num_samples('train') == 8
    assert data.num_samples('test') == 1
    assert data.num_samples('val') == 1

def _test_data_read_samples(data):
    train_samples = list(data.load('train'))
    assert train_samples == [
        ('content8-transformed', None), ('content2-transformed', None),
        ('content9-transformed', None), ('content3-transformed', None),
        ('content5-transformed', None), ('content7-transformed', None)]
    assert len(train_samples) == 6

    val_samples = list(data.load('val'))#
    assert val_samples == [('content0-transformed', None), ('content1-transformed', None)]
    assert len(val_samples) == 2

    test_samples = list(data.load('test'))#
    assert test_samples == [('content4-transformed', None), ('content6-transformed', None)]
    assert len(test_samples) == 2

def _test_data_read_samples_transformed(data):
    train_samples = list(data.load('train'))
    assert train_samples == [
        ('content8-hello-transformed', None), ('content2-hello-transformed', None),
        ('content9-hello-transformed', None), ('content3-hello-transformed', None),
        ('content5-hello-transformed', None), ('content7-hello-transformed', None)]
    assert len(train_samples) == 6

    val_samples = list(data.load('val'))#
    assert val_samples == [('content0-hello-transformed', None),
                           ('content1-hello-transformed', None)]
    assert len(val_samples) == 2

    test_samples = list(data.load('test'))#
    assert test_samples == [('content4-hello-transformed', None),
                            ('content6-hello-transformed', None)]
    assert len(test_samples) == 2

def _test_data_read_samples_transformed_x2(data):
    train_samples = list(data.load('train'))
    assert train_samples == [
        ('content8-transformed', None), ('content8-transformed', None),
        ('content2-transformed', None), ('content2-transformed', None),
        ('content9-transformed', None), ('content9-transformed', None),
        ('content3-transformed', None), ('content3-transformed', None),
        ('content5-transformed', None), ('content5-transformed', None),
        ('content7-transformed', None), ('content7-transformed', None)]
    assert len(train_samples) == 12

    val_samples = list(data.load('val'))#
    assert val_samples == [('content0-transformed', None), ('content0-transformed', None),
                           ('content1-transformed', None), ('content1-transformed', None)]
    assert len(val_samples) == 4

    test_samples = list(data.load('test'))#
    assert test_samples == [('content4-transformed', None), ('content4-transformed', None),
                            ('content6-transformed', None), ('content6-transformed', None)]
    assert len(test_samples) == 4


def _test_data_read_samples_x2_between(data):
    train_samples = data.load('train')[1:7]
    assert train_samples == \
        [('content8-transformed', None),
         ('content2-transformed', None), ('content2-transformed', None),
         ('content9-transformed', None), ('content9-transformed', None),
         ('content3-transformed', None)]


def _prepare_dir(tmpdir):
    for i in range(0, 10):
        path = tmpdir.join(f"file{i}.test")
        path.write("content" + str(i))
    cache_dir = tmpdir.mkdir('.cache')
    return str(cache_dir)

@source('test-source', 'A test source.', input_patterns="**/*.test") # pylint: disable=W0223
class SourceTest(SourcePlugin):

    def __init__(self, args: None):
        self.files = None
        super().__init__((args or {}).copy())

    def begin_read_samples(self):
        if self.files:
            return

        self.meta['some-meta'] = 'meta-value'

        self.files = self.scan_and_split_files()

    def num_samples(self, split: str) -> int:
        return len(self.files[split])

    def read_samples(self, split, index, n=1):
        items = self.files[split][index:index+n]


        items = [(Path(filename).read_text(), meta) for filename, meta in items]

        res = []
        for item, meta in items:
            rng = random.Random(str(self.random_seed) + meta['filename'])
            res.append(Sample(item, None, meta.copy(), rng))

        return res

    def transform(self, sample):
        sample.x = sample.x + '-transformed'
        sample.y = None
        return sample

    def hash(self, state: str) -> str:
        return super().hash(state + self.hash_files(self.files))


@operation('append')
class AppendStringOperation(OperationPlugin):
    type = str

    def transform(self, data, rng):
        return data + "-hello"

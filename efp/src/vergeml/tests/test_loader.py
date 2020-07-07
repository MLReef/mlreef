"""
Tests data loading (cached + direct).
"""
import random

from pathlib import Path

from vergeml.loader import MemoryCachedLoader, LiveLoader, FileCachedLoader
from vergeml.io import SourcePlugin, source, Sample
from vergeml.operation import OperationPlugin, operation
from vergeml.operations.augment import AugmentOperation

# pylint: disable=C0111

# -------------------------------------------------

def test_live_loader_meta(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    loader = LiveLoader(cache_dir, src)
    _test_loader_meta(loader)

def test_mem_loader_meta(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    loader = MemoryCachedLoader(cache_dir, src)
    _test_loader_meta(loader)

def test_disk_loader_meta(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    loader = FileCachedLoader(cache_dir, src)
    _test_loader_meta(loader)

# -------------------------------------------------

def test_live_loader_with_ops_meta(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    loader = LiveLoader(cache_dir, src, ops=[AppendStringOperation()], output=src)
    _test_loader_meta(loader)

def test_mem_out_loader_with_ops_meta(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    loader = MemoryCachedLoader(cache_dir, src, ops=[AppendStringOperation()], output=src)
    _test_loader_meta(loader)

def test_disk_out_loader_with_ops_meta(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    loader = FileCachedLoader(cache_dir, src, ops=[AppendStringOperation()], output=src)
    _test_loader_meta(loader)

def test_mem_loader_with_ops_meta(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    loader = MemoryCachedLoader(cache_dir, src)
    loader2 = LiveLoader(cache_dir, loader, ops=[AppendStringOperation()], output=src)
    _test_loader_meta(loader2)

def test_disk_loader_with_ops_meta(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    loader = FileCachedLoader(cache_dir, src)
    loader2 = LiveLoader(cache_dir, loader, ops=[AppendStringOperation()], output=src)
    _test_loader_meta(loader2)

# -------------------------------------------------

def test_live_loader_num_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    loader = LiveLoader(cache_dir, src)
    _test_loader_num_samples(loader)

def test_mem_loader_num_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    loader = MemoryCachedLoader(cache_dir, src)
    _test_loader_num_samples(loader)

def test_disk_loader_num_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    loader = FileCachedLoader(cache_dir, src)
    _test_loader_num_samples(loader)

# -------------------------------------------------

def test_live_loader_ops_num_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    loader = LiveLoader(cache_dir, src, ops=[AppendStringOperation()], output=src)
    _test_loader_num_samples(loader)

def test_mem_out_loader_ops_num_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    loader = MemoryCachedLoader(cache_dir, src, ops=[AppendStringOperation()], output=src)
    _test_loader_num_samples(loader)

def test_disk_out_loader_ops_num_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    loader = FileCachedLoader(cache_dir, src, ops=[AppendStringOperation()], output=src)
    _test_loader_num_samples(loader)

def test_mem_loader_ops_num_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    loader = MemoryCachedLoader(cache_dir, src)
    loader2 = LiveLoader(cache_dir, loader, ops=[AppendStringOperation()], output=src)
    _test_loader_num_samples(loader2)

def test_disk_loader_ops_num_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir)})
    loader = FileCachedLoader(cache_dir, src)
    loader2 = LiveLoader(cache_dir, loader, ops=[AppendStringOperation()], output=src)
    _test_loader_num_samples(loader2)

# --------------------------------------------------

def test_mem_loader_read_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    loader = MemoryCachedLoader(cache_dir, src)
    _test_loader_read_samples(loader)


def test_live_loader_read_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    loader = LiveLoader(cache_dir, src)
    _test_loader_read_samples(loader)

def test_disk_loader_read_samples(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    loader = FileCachedLoader(cache_dir, src)
    _test_loader_read_samples(loader)

# --------------------------------------------------

def test_live_loader_with_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    loader = LiveLoader(cache_dir, src, ops=[AppendStringOperation()], output=src)
    _test_loader_read_samples_transformed(loader)

def test_mem_loader_with_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    loader = MemoryCachedLoader(cache_dir, src)
    loader2 = LiveLoader(cache_dir, loader, ops=[AppendStringOperation()], output=src)
    _test_loader_read_samples_transformed(loader2)

def test_mem_out_loader_with_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    loader = MemoryCachedLoader(cache_dir, src, ops=[AppendStringOperation()], output=src)
    _test_loader_read_samples_transformed(loader)

def test_disk_loader_with_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    loader = FileCachedLoader(cache_dir, src)
    loader2 = LiveLoader(cache_dir, loader, ops=[AppendStringOperation()], output=src)
    _test_loader_read_samples_transformed(loader2)

def test_disk_out_loader_with_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    loader = FileCachedLoader(cache_dir, src, ops=[AppendStringOperation()], output=src)
    _test_loader_read_samples_transformed(loader)

# --------------------------------------------------

def test_live_loader_with_multiplier_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    ops = [AugmentOperation(variants=2), AppendStringOperation()]
    loader = LiveLoader(cache_dir, src, ops=ops, output=src)
    _test_loader_read_samples_x2(loader)


def test_mem_out_loader_with_multiplier_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    ops = [AugmentOperation(variants=2), AppendStringOperation()]
    loader = MemoryCachedLoader(cache_dir, src, ops=ops, output=src)
    _test_loader_read_samples_x2(loader)


def test_disk_out_loader_with_multiplier_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    ops = [AugmentOperation(variants=2), AppendStringOperation()]
    loader = FileCachedLoader(cache_dir, src, ops=ops, output=src)
    _test_loader_read_samples_x2(loader)


def test_mem_loader_with_multiplier_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    loader = MemoryCachedLoader(cache_dir, src)
    ops = [AugmentOperation(variants=2), AppendStringOperation()]
    loader2 = LiveLoader(cache_dir, loader, ops=ops, output=src)
    _test_loader_read_samples_x2(loader2)


def test_disk_loader_with_multiplier_ops(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    loader = FileCachedLoader(cache_dir, src)
    ops = [AugmentOperation(variants=2), AppendStringOperation()]
    loader2 = LiveLoader(cache_dir, loader, ops=ops, output=src)
    _test_loader_read_samples_x2(loader2)

# --------------------------------------------------

def test_live_loader_with_multiplier_ops_between(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    ops = [AugmentOperation(variants=2), AppendStringOperation()]
    loader = LiveLoader(cache_dir, src, ops=ops, output=src)
    _test_loader_read_samples_x2_between(loader)

def test_mem_out_loader_with_multiplier_ops_between(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    ops = [AugmentOperation(variants=2), AppendStringOperation()]
    loader = MemoryCachedLoader(cache_dir, src, ops=ops, output=src)
    _test_loader_read_samples_x2_between(loader)

def test_disk_out_loader_with_multiplier_ops_between(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    ops = [AugmentOperation(variants=2), AppendStringOperation()]
    loader = FileCachedLoader(cache_dir, src, ops=ops, output=src)
    _test_loader_read_samples_x2_between(loader)

def test_mem_loader_with_multiplier_ops_between(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    loader = MemoryCachedLoader(cache_dir, src)
    ops = [AugmentOperation(variants=2), AppendStringOperation()]
    loader2 = LiveLoader(cache_dir, loader, ops=ops, output=src)
    _test_loader_read_samples_x2_between(loader2)

def test_disk_loader_with_multiplier_ops_between(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    loader = FileCachedLoader(cache_dir, src)
    ops = [AugmentOperation(variants=2), AppendStringOperation()]
    loader2 = LiveLoader(cache_dir, loader, ops=ops, output=src)
    _test_loader_read_samples_x2_between(loader2)

# --------------------------------------------------

def test_mem_loader_with_rng_no_reset(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    loader = MemoryCachedLoader(cache_dir, src)
    _test_loader_with_rng_no_reset(loader)

def test_live_loader_with_rng_no_reset(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    loader = LiveLoader(cache_dir, src)
    _test_loader_with_rng_no_reset(loader)

def test_disk_loader_with_rng_no_reset(tmpdir):
    cache_dir = _prepare_dir(tmpdir)
    src = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    loader = FileCachedLoader(cache_dir, src)
    _test_loader_with_rng_no_reset(loader)

# ---------------------------------------------------------------------------------

def _test_loader_meta(loader):
    loader.begin_read_samples()
    assert loader.meta['some-meta'] == 'meta-value'
    loader.end_read_samples()

def _test_loader_num_samples(loader):
    loader.begin_read_samples()
    assert loader.num_samples('train') == 8
    assert loader.num_samples('test') == 1
    assert loader.num_samples('val') == 1
    loader.end_read_samples()

def _test_loader_read_samples(loader):
    loader.begin_read_samples()
    train_samples = loader.read_samples('train', 0, loader.num_samples('train'))
    assert list(map(lambda s: s.x, train_samples)) == \
        ['content8', 'content2', 'content9', 'content3', 'content5', 'content7']
    assert len(train_samples) == 6

    val_samples = loader.read_samples('val', 0, loader.num_samples('val'))
    assert list(map(lambda s: s.x, val_samples)) == \
        ['content0', 'content1']
    assert len(val_samples) == 2

    test_samples = loader.read_samples('test', 0, loader.num_samples('test'))
    assert list(map(lambda s: s.x, test_samples)) == \
        ['content4', 'content6']
    assert len(test_samples) == 2
    loader.end_read_samples()

def _test_loader_read_samples_transformed(loader):
    loader.begin_read_samples()
    train_samples = loader.read_samples('train', 0, loader.num_samples('train'))
    assert list(map(lambda s: s.x, train_samples)) == \
        ['content8-hello-transformed', 'content2-hello-transformed', 'content9-hello-transformed',
         'content3-hello-transformed', 'content5-hello-transformed', 'content7-hello-transformed']
    assert len(train_samples) == 6

    val_samples = loader.read_samples('val', 0, loader.num_samples('val'))
    assert list(map(lambda s: s.x, val_samples)) == \
        ['content0-hello-transformed', 'content1-hello-transformed']
    assert len(val_samples) == 2

    test_samples = loader.read_samples('test', 0, loader.num_samples('test'))
    assert list(map(lambda s: s.x, test_samples)) == \
        ['content4-hello-transformed', 'content6-hello-transformed']
    assert len(test_samples) == 2
    loader.end_read_samples()

def _test_loader_read_samples_x2(loader):
    loader.begin_read_samples()
    train_samples = loader.read_samples('train', 0, loader.num_samples('train'))
    assert list(map(lambda s: s.x, train_samples)) == \
        ['content8-hello-transformed', 'content8-hello-transformed',
         'content2-hello-transformed', 'content2-hello-transformed',
         'content9-hello-transformed', 'content9-hello-transformed',
         'content3-hello-transformed', 'content3-hello-transformed',
         'content5-hello-transformed', 'content5-hello-transformed',
         'content7-hello-transformed', 'content7-hello-transformed', ]
    assert len(train_samples) == 12

    val_samples = loader.read_samples('val', 0, loader.num_samples('val'))
    assert list(map(lambda s: s.x, val_samples)) == \
        ['content0-hello-transformed', 'content0-hello-transformed',
         'content1-hello-transformed', 'content1-hello-transformed']
    assert len(val_samples) == 4

    test_samples = loader.read_samples('test', 0, loader.num_samples('test'))
    assert list(map(lambda s: s.x, test_samples)) == \
        ['content4-hello-transformed', 'content4-hello-transformed',
         'content6-hello-transformed', 'content6-hello-transformed']
    assert len(test_samples) == 4
    loader.end_read_samples()

def _test_loader_read_samples_x2_between(loader):
    loader.begin_read_samples()
    train_samples = loader.read_samples('train', 1, 6)
    assert list(map(lambda s: s.x, train_samples)) == \
        ['content8-hello-transformed',
         'content2-hello-transformed', 'content2-hello-transformed',
         'content9-hello-transformed', 'content9-hello-transformed',
         'content3-hello-transformed']

def _test_loader_with_rng_no_reset(loader):
    loader.begin_read_samples()
    sample = loader.read_samples('train', 0)[0]
    rnum = sample.rng.randint(1, 1000000)
    sample = loader.read_samples('train', 0)[0]
    assert rnum != sample.rng.randint(1, 1000000)
    loader.end_read_samples()

def _prepare_dir(tmpdir):
    for i in range(0, 10):
        path = tmpdir.join(f"file{i}.test")
        path.write("content" + str(i))
    cache_dir = tmpdir.mkdir('.cache')
    return str(cache_dir)


@source('test-source', 'A test source.', input_patterns="**/*.test") # pylint: disable=W0223
class SourceTest(SourcePlugin):

    def __init__(self, args=None):
        self.files = None
        super().__init__(args or {})

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

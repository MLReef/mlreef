from vergeml.env import Environment
from vergeml.data import Data
from vergeml.io import source, SourcePlugin, Sample
from vergeml.operation import operation, OperationPlugin
from vergeml.operations.augment import AugmentOperation
from vergeml.plugins import _DictPluginManager
import random

def test_data_live_loader_meta(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
data:
    input:
        type: test
    cache: none
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_meta(data)

def test_data_mem_loader_meta(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
data:
    input:
        type: test
    cache: mem
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_meta(data)

def test_data_disk_loader_meta(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
data:
    input:
        type: test
    cache: disk
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_meta(data)

# ---------------------------------------------------------------------------------

def test_data_live_loader_with_ops_meta(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
data:
    input:
        type: test

    preprocess:
        - op: append

    cache: none
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_meta(data)

def test_data_mem_out_loader_with_ops_meta(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
data:
    input:
        type: test

    preprocess:
        - op: append

    cache: mem
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_meta(data)

def test_data_disk_out_loader_with_ops_meta(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
data:
    input:
        type: test

    preprocess:
        - op: append

    cache: disk
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_meta(data)

def test_data_mem_loader_with_ops_meta(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
data:
    input:
        type: test

    preprocess:
        - op: append

    cache: mem-in
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_meta(data)

def test_data_disk_loader_with_ops_meta(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
data:
    input:
        type: test

    preprocess:
        - op: append

    cache: disk-in
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_meta(data)

# -------------------------------------------------

def test_data_live_loader_num_samples(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
data:
    input:
        type: test

    cache: none
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_num_samples(data)

def test_data_mem_loader_num_samples(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
data:
    input:
        type: test

    cache: mem-in
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_num_samples(data)

def test_data_disk_loader_num_samples(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
data:
    input:
        type: test

    cache: disk-in
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_num_samples(data)

# -------------------------------------------------


def test_data_live_loader_ops_num_samples(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
data:
    input:
        type: test

    preprocess:
        - op: append
    cache: none
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_num_samples(data)

def test_data_mem_out_loader_ops_num_samples(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
data:
    input:
        type: test

    preprocess:
        - op: append
    cache: mem
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_num_samples(data)

def test_data_disk_out_loader_ops_num_samples(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
data:
    input:
        type: test

    preprocess:
        - op: append
    cache: disk
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_num_samples(data)

def test_data_mem_loader_ops_num_samples(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
data:
    input:
        type: test

    preprocess:
        - op: append
    cache: mem-in
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_num_samples(data)

def test_data_disk_loader_ops_num_samples(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
data:
    input:
        type: test

    preprocess:
        - op: append
    cache: disk-in
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_num_samples(data)

# -------------------------------------------------

def test_data_mem_loader_read_samples(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    cache: mem-in
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples(data)

def test_data_live_loader_read_samples(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    cache: none
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples(data)

def test_data_disk_loader_read_samples(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    cache: disk-in
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples(data)

# --------------------------------------------------


def test_data_live_loader_with_ops(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    preprocess:
        - op: append

    cache: none
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples_transformed(data)

def test_data_mem_loader_with_ops(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    preprocess:
        - op: append

    cache: mem-in
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples_transformed(data)

def test_data_mem_out_loader_with_ops(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    preprocess:
        - op: append

    cache: mem
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples_transformed(data)

def test_data_disk_loader_with_ops(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    preprocess:
        - op: append

    cache: disk-in
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples_transformed(data)

def test_data_disk_out_loader_with_ops(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    preprocess:
        - op: append

    cache: disk
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples_transformed(data)

# --------------------------------------------------


def test_data_live_loader_with_multiplier_ops(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    preprocess:
        - op: augment
          variants: 2

    cache: none
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples_transformed_x2(data)


def test_data_mem_out_loader_with_multiplier_ops(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    preprocess:
        - op: augment
          variants: 2

    cache: mem
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples_transformed_x2(data)


def test_data_disk_out_loader_with_multiplier_ops(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    preprocess:
        - op: augment
          variants: 2

    cache: disk
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples_transformed_x2(data)


def test_data_mem_loader_with_multiplier_ops(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    preprocess:
        - op: augment
          variants: 2

    cache: mem-in
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples_transformed_x2(data)


def test_data_disk_loader_with_multiplier_ops(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    preprocess:
        - op: augment
          variants: 2

    cache: disk-in
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples_transformed_x2(data)

# --------------------------------------------------

def test_data_live_loader_with_multiplier_ops_between(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    preprocess:
        - op: augment
          variants: 2

    cache: none
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples_x2_between(data)

def test_data_mem_out_loader_with_multiplier_ops_between(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    preprocess:
        - op: augment
          variants: 2

    cache: mem
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples_x2_between(data)

def test_data_disk_out_loader_with_multiplier_ops_between(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    preprocess:
        - op: augment
          variants: 2

    cache: disk
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples_x2_between(data)

def test_data_mem_loader_with_multiplier_ops_between(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    preprocess:
        - op: augment
          variants: 2

    cache: mem-in
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples_x2_between(data)

def test_data_disk_loader_with_multiplier_ops_between(tmpdir):
    _prepare_dir(tmpdir)
    project_file = tmpdir.join("vergeml.yaml")
    project_file.write("""\
test-split: 2
val-split: 2

data:
    input:
        type: test

    preprocess:
        - op: augment
          variants: 2

    cache: disk-in
""")
    env = Environment(project_dir=str(tmpdir), project_file=str(project_file), plugins=PLUGINS)
    data = Data(env, plugins=PLUGINS)
    _test_data_read_samples_x2_between(data)

# --------------------------------------------------

def _test_data_meta(data):
    assert data.meta['some-meta'] == 'meta-value'

def _test_data_num_samples(data):
    assert data.num_samples('train')  == 8
    assert data.num_samples('test') == 1
    assert data.num_samples('val') == 1

def _prepare_dir(tmpdir):
    samples_dir = tmpdir.mkdir('samples')
    for i in range(0, 10):
        p = samples_dir.join(f"file{i}.test")
        p.write("content" + str(i))
    tmpdir.mkdir('.cache')


def _test_data_read_samples(data):
    train_samples = list(data.load('train'))
    assert train_samples == [
        ('content8-transformed', None),('content2-transformed', None), ('content9-transformed', None),
        ('content3-transformed', None), ('content5-transformed', None), ('content7-transformed', None)]
    assert len(train_samples) == 6

    val_samples = list(data.load('val'))#
    assert val_samples == [('content0-transformed', None),('content1-transformed', None)]
    assert len(val_samples) == 2

    test_samples = list(data.load('test'))#
    assert test_samples == [('content4-transformed', None),('content6-transformed', None)]
    assert len(test_samples) == 2

def _test_data_read_samples_transformed(data):
    train_samples = list(data.load('train'))
    assert train_samples == [
        ('content8-hello-transformed', None),('content2-hello-transformed', None), ('content9-hello-transformed', None),
        ('content3-hello-transformed', None), ('content5-hello-transformed', None), ('content7-hello-transformed', None)]
    assert len(train_samples) == 6

    val_samples = list(data.load('val'))#
    assert val_samples == [('content0-hello-transformed', None),('content1-hello-transformed', None)]
    assert len(val_samples) == 2

    test_samples = list(data.load('test'))#
    assert test_samples == [('content4-hello-transformed', None),('content6-hello-transformed', None)]
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
    assert val_samples == [('content0-transformed', None),('content0-transformed', None),
                           ('content1-transformed', None),('content1-transformed', None)]
    assert len(val_samples) == 4

    test_samples = list(data.load('test'))#
    assert test_samples == [('content4-transformed', None),('content4-transformed', None),
                            ('content6-transformed', None),('content6-transformed', None)]
    assert len(test_samples) == 4


def _test_data_read_samples_x2_between(data):
    train_samples = data.load('train')[1:7]
    assert train_samples == \
        [('content8-transformed', None),
         ('content2-transformed', None), ('content2-transformed', None),
         ('content9-transformed', None), ('content9-transformed', None),
         ('content3-transformed', None) ]


@source('test-source', 'A test source.', input_patterns="**/*.test")
class SourceTest(SourcePlugin):

    def __init__(self, args: dict={}):
        self.files = None
        super().__init__(args)

    def begin_read_samples(self):
        if self.files:
            return

        self.meta['some-meta'] = 'meta-value'

        self.files = self.scan_and_split_files()

    def num_samples(self, split: str) -> int:
        return len(self.files[split])

    def read_samples(self, split, index, n=1):
        items = self.files[split][index:index+n]
        items = [(self.read_file(filename), meta) for filename, meta in items]

        res = []
        for item, meta in items:
            rng = random.Random(str(self.random_seed) + meta['filename'])
            res.append(Sample(item, None, meta.copy(), rng))

        return res

    def read_file(self, path):
        with open(path, "r") as f:
            return f.read()

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

PLUGINS = _DictPluginManager()
PLUGINS.set('vergeml.io', 'test', SourceTest)
PLUGINS.set('vergeml.operation', 'append', AppendStringOperation)
PLUGINS.set('vergeml.operation', 'augment', AugmentOperation)

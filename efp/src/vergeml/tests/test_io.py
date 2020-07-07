from vergeml.io import SourcePlugin, Source, source, Sample
from vergeml.option import option
import random


def test_source_scan(tmpdir):
    _prepare_dir(tmpdir)
    st = SourceTest({'samples-dir': str(tmpdir)})
    st.begin_read_samples()
    assert st.num_samples('train') == 8
    assert st.num_samples('test') == 1
    assert st.num_samples('val') == 1
    
def test_source_config_split_perc(tmpdir):
    _prepare_dir(tmpdir)
    st = SourceTest({'samples-dir': str(tmpdir), 'val-split': '20%'})
    st.begin_read_samples()
    assert st.num_samples('train') == 7
    assert st.num_samples('test') == 1
    assert st.num_samples('val') == 2

def test_source_config_split_num(tmpdir):
    _prepare_dir(tmpdir)
    st = SourceTest({'samples-dir': str(tmpdir), 'test-split': 4})
    st.begin_read_samples()
    assert st.num_samples('train') == 5
    assert st.num_samples('test') == 4
    assert st.num_samples('val') == 1

def test_source_config_split_dir(tmpdir):
    _prepare_dir(tmpdir)
    test_dir = tmpdir.mkdir('test')
    _prepare_dir(test_dir)
    st = SourceTest({'samples-dir': str(tmpdir), 'test-split': str(test_dir)})
    st.begin_read_samples()
    assert st.num_samples('train') == 9
    assert st.num_samples('test') == 10
    assert st.num_samples('val') == 1

def test_reproduce_hash(tmpdir):
    _prepare_dir(tmpdir)
    st = SourceTest({'samples-dir': str(tmpdir), 'test-split': 4})
    st.begin_read_samples()
    hash_value = st.hash("abc")
    st = SourceTest({'samples-dir': str(tmpdir), 'test-split': 4})
    st.begin_read_samples()
    assert st.hash("abc") == hash_value
    # calling hash again still yields the same value
    assert st.hash("abc") == hash_value
    st = SourceTest({'samples-dir': str(tmpdir), 'test-split': 3})
    st.begin_read_samples()
    # different params yield a different value
    assert st.hash("abc") != hash_value


def test_read_source(tmpdir):
    _prepare_dir(tmpdir)
    st = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    st.begin_read_samples()

    train_samples = st.read_samples('train', 0, st.num_samples('train'))
    assert list(map(lambda s: s.x, train_samples)) == \
        ['content8', 'content2', 'content9', 'content3', 'content5', 'content7']
    assert len(train_samples) == 6
    
    val_samples = st.read_samples('val', 0, st.num_samples('train'))
    assert list(map(lambda s: s.x, val_samples)) == \
        ['content0', 'content1']
    assert len(val_samples) == 2

    test_samples = st.read_samples('test', 0, st.num_samples('test'))
    assert list(map(lambda s: s.x, test_samples)) == \
        ['content4', 'content6']
    assert len(test_samples) == 2

def test_repeatable_split(tmpdir):
    _prepare_dir(tmpdir)

    st = SourceTest({'samples-dir': str(tmpdir), 'test-split': 2, 'val-split': 2})
    st.begin_read_samples()

    train_samples = st.read_samples('train', 0, st.num_samples('train'))
    filenames = list(map(lambda s: s.meta['filename'], train_samples))
    assert filenames == ['file8.test', 'file2.test', 'file9.test', 'file3.test', 'file5.test', 'file7.test']
    
    val_samples = st.read_samples('val', 0, st.num_samples('train'))
    filenames = list(map(lambda s: s.meta['filename'],val_samples))
    assert filenames == ['file0.test', 'file1.test']

    test_samples = st.read_samples('test', 0, st.num_samples('test'))
    filenames = list(map(lambda s: s.meta['filename'],test_samples))
    assert filenames == ['file4.test', 'file6.test']

@source('test-source', 'A test source.', input_patterns="**/*.test")
class SourceTest(SourcePlugin):

    def __init__(self, args: dict={}):
        self.files = None
        super().__init__(args)
            
    def begin_read_samples(self):
        if self.files:
            return
        
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
        sample.x = list(sample)
        sample.y = None
        return sample

    def hash(self, state: str) -> str:
        return super().hash(state + self.hash_files(self.files))


def _prepare_dir(tmpdir):
    for i in range(0, 10):
        p = tmpdir.join(f"file{i}.test")
        p.write("content" + str(i))

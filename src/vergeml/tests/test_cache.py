from vergeml.cache import FileCache, MemoryCache, SerializedFileCache, _NUMPY, _PICKLE, _BYTES
import numpy as np

# TODO test composite values

def test_read_write_ser_pickle(tmpdir):
    path = str(tmpdir.dirpath("test.cache"))
    wcache = SerializedFileCache(path, "w", compress=True)
    for i in range(10):
        wcache.write(data=dict(x=i), meta=dict(meta=i))
    wcache.close()
    rcache = SerializedFileCache(path, "r", compress=True)

    res = rcache.read(0, 5)
    assert res[0][0] == dict(x=0)
    assert res[0][1] == dict(meta=0)
    assert res[4][0] == dict(x=4)
    assert res[4][1] == dict(meta=4)

    res = rcache.read(5, 5)
    assert res[0][0] == dict(x=5)
    assert res[0][1] == dict(meta=5)
    assert res[4][0] == dict(x=9)
    assert res[4][1] == dict(meta=9)

    assert rcache.cnt.info[0] == _PICKLE

def test_read_write_ser_numpy_comp(tmpdir):
    _test_read_write_ser(tmpdir.dirpath("test.cache"), True, np.zeros((2,3)), _NUMPY)

def test_read_write_ser_numpy_numpy_comp(tmpdir):
    _test_read_write_ser(tmpdir.dirpath("test.cache"), True, (np.zeros((2,3)), np.zeros((2,3))), (_NUMPY, _NUMPY))

def test_read_write_ser_numpy_pickle_comp(tmpdir):
    _test_read_write_ser(tmpdir.dirpath("test.cache"), True, (np.zeros((2,3)), None), (_NUMPY, _PICKLE))

def test_read_write_ser_bytes_comp(tmpdir):
    _test_read_write_ser(tmpdir.dirpath("test.cache"), True, bytes(range(0, 10)), _BYTES)

def test_read_write_ser_numpy(tmpdir):
    _test_read_write_ser(tmpdir.dirpath("test.cache"), False, np.zeros((2,3)), _NUMPY)

def test_read_write_ser_numpy_numpy(tmpdir):
    _test_read_write_ser(tmpdir.dirpath("test.cache"), False, (np.zeros((2,3)), np.zeros((2,3))), (_NUMPY, _NUMPY))

def test_read_write_ser_numpy_pickle(tmpdir):
    _test_read_write_ser(tmpdir.dirpath("test.cache"), False, (np.zeros((2,3)), None), (_NUMPY, _PICKLE))

def test_read_write_ser_bytes(tmpdir):
    _test_read_write_ser(tmpdir.dirpath("test.cache"), False, bytes(range(0, 10)), _BYTES)

def _test_read_write_ser(path, compress, data, type):
    wcache = SerializedFileCache(str(path), "w", compress=compress)
    for i in range(10):
        wcache.write(data=data, meta=dict(meta=i))
    wcache.close()
    rcache = SerializedFileCache(path, "r", compress=compress)

    def cmpf(x, y, tp=type):
        if tp == _BYTES or tp == _PICKLE:
            return x == y
        elif tp == _NUMPY:
            return np.array_equal(x, y)
        elif isinstance(tp, tuple):
            return cmpf(x[0], y[0], tp[0]) and cmpf(x[1], y[1], tp[1])

    res = rcache.read(0, 5)
    assert cmpf(res[0][0], data)
    assert res[0][1] == dict(meta=0)
    assert cmpf(res[4][0], data)
    assert res[4][1] == dict(meta=4)

    res = rcache.read(5, 5)
    assert cmpf(res[0][0], data)
    assert res[0][1] == dict(meta=5)
    assert cmpf(res[4][0], data)
    assert res[4][1] == dict(meta=9)

    assert rcache.cnt.info[0] == type

def test_file(tmpdir):
    path = tmpdir.dirpath("test.cache")
    wcache = FileCache(str(path), "w")
    for i in range(10):
        wcache.write(bytes(range(i, i+10)), meta=dict(meta=i))
    wcache.close()
    rcache = FileCache(path, "r")

    res = rcache.read(0, 5)
    assert res[0][0] == bytes(range(0, 10))
    assert res[0][1] == dict(meta=0)
    assert res[4][0] == bytes(range(4, 14))
    assert res[4][1] == dict(meta=4)

    res = rcache.read(5, 5)
    assert res[0][0] == bytes(range(5, 15))
    assert res[0][1] == dict(meta=5)
    assert res[4][0] == bytes(range(9, 19))
    assert res[4][1] == dict(meta=9)

def test_memory():
    cache = MemoryCache()
    for i in range(10):
        cache.write(data=dict(x=i), meta=dict(meta=i))

    res = cache.read(0, 5)
    assert res[0][0] == dict(x=0)
    assert res[0][1] == dict(meta=0)
    assert res[4][0] == dict(x=4)
    assert res[4][1] == dict(meta=4)

    res = cache.read(5, 5)
    assert res[0][0] == dict(x=5)
    assert res[0][1] == dict(meta=5)
    assert res[4][0] == dict(x=9)
    assert res[4][1] == dict(meta=9)

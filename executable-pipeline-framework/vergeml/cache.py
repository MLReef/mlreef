"""
Sample caching support.
"""

import struct
import pickle
import mmap
import io
import numpy as np
import lz4.frame

from vergeml import VergeMLError

class Cache:
    """Abstract base class for caches.
    """

    def write(self, data, meta):
        """Write data and metadata to the cache.
        """
        raise NotImplementedError

    def read(self, index, n_samples):
        """Read n_samples at index from the cache.
        """
        raise NotImplementedError

class MemoryCache(Cache):
    """Cache samples in memory.
    """

    def __init__(self):
        self.data = []

    def __len__(self):
        return len(self.data)

    def write(self, data, meta):
        self.data.append((data, meta))

    def read(self, index, n_samples):
        return self.data[index:index+n_samples]

class _CacheFileContent:

    def __init__(self):

        # An index of the positions of the stored data items.
        self.index = []

        # Sample metadata.
        self.meta = []

        # Info (Used to store data types)
        self.info = None

    def read(self, file, path):
        """Read the content index from file.
        """
        pos, = struct.unpack('<Q', file.read(8))
        if pos == 0:
            raise VergeMLError("Invalid cache file: {}".format(path))
        file.seek(pos)
        self.index, self.meta, self.info = pickle.load(file)

    def write(self, file):
        """Write the content index to file and update the header.
        """
        pos = file.tell()
        pickle.dump((self.index, self.meta, self.info), file)
        file.seek(0)

        # update the header with the position of the content index.
        file.write(struct.pack('<Q', pos))

class FileCache(Cache):
    """Cache raw bytes in a mmapped file.
    """

    def __init__(self, path, mode):
        assert mode in ("r", "w")

        self.path = path
        self.file = open(self.path, mode + "b")
        self.mmfile = None
        self.mode = mode
        self.cnt = _CacheFileContent()

        if mode == "r":
            # Read the last part of the file which contains the contents of the
            # cache.
            self.cnt.read(self.file, self.path)
            self.mmfile = mmap.mmap(self.file.fileno(), 0, access=mmap.ACCESS_READ)
        else:
            # The 8 bytes header contain the position of the content index.
            # We fill this header with zeroes and write the actual position
            # once all samples have been written to the cache
            self.file.write(struct.pack('<Q', 0))

    def __len__(self):
        return len(self.cnt.index)

    def write(self, data, meta):
        assert self.mode == "w"

        pos = self.file.tell()
        entry = (pos, pos + len(data))

        # write position and metadata of the data to the content index
        self.cnt.index.append(entry)
        self.cnt.meta.append(meta)
        self.file.write(data)

    def read(self, index, n_samples):
        assert self.mode == "r"

        c_ix = self.cnt.index

        # get the absolute start and end adresses of the whole chunk
        abs_start, _ = c_ix[index]
        _, abs_end = c_ix[index+n_samples-1]

        # read the bytes and wrap in memory view to avoid copying
        chunk = memoryview(self.mmfile[abs_start:abs_end])

        res = []

        for i in range(n_samples):
            start, end = c_ix[index+i]

            # convert addresses to be relative to the chunk we read
            start = start - abs_start
            end = end - abs_start

            data = chunk[start:end]
            res.append((data, self.cnt.meta[index+i]))
        return res

    def close(self):
        """Close the cache file.

        When the cache file is being written to, this method will write
        the content index at the end of the file.
        """
        if self.mode == "w":
            # Write the content index
            self.cnt.write(self.file)

        self.file.close()

# The three basic serialization methods:
# raw bytes, numpy format or python pickle.
_BYTES, _NUMPY, _PICKLE = range(3)

class SerializedFileCache(FileCache):
    """Cache serialized objects in a mmapped file.
    """

    def __init__(self, path, mode, compress=True):
        """Create an optionally compressed serialized cache.
        """
        super().__init__(path, mode)

        # we use info to store type information
        self.cnt.info = self.cnt.info or []
        self.compress = compress

    def _serialize_data(self, data):

        # Default to raw bytes
        type_ = _BYTES

        if isinstance(data, np.ndarray):
        # When the data is a numpy array, use the more compact native
        # numpy format.
            buf = io.BytesIO()
            np.save(buf, data)
            data = buf.getvalue()
            type_ = _NUMPY

        elif not isinstance(data, (bytearray, bytes)):
        # Everything else except byte data is serialized in pickle format.
            data = pickle.dumps(data)
            type_ = _PICKLE

        if self.compress:
        # Optional compression
            data = lz4.frame.compress(data)

        return type_, data

    def _deserialize(self, data, type_):

        if self.compress:
        # decompress the data if needed
            data = lz4.frame.decompress(data)

        if type_ == _NUMPY:
        # deserialize numpy arrays
            buf = io.BytesIO(data)
            data = np.load(buf)

        elif type_ == _PICKLE:
        # deserialize other python objects
            data = pickle.loads(data)

        else:
        # Otherwise we just return data as it is (bytes)
            pass

        return data

    def write(self, data, meta):

        if isinstance(data, tuple) and len(data) == 2:
            # write (x,y) pairs

            # serialize independent from each other
            type1, data1 = self._serialize_data(data[0])
            type2, data2 = self._serialize_data(data[1])

            pos = len(data1)
            data = io.BytesIO()

            # an entry wich consists of two items carries the position
            # of the second item in its header.
            data.write(struct.pack('<Q', pos))

            data.write(data1)
            data.write(data2)
            data = data.getvalue()

            # mark the entry as pair
            type_ = (type1, type2)

        else:
            type_, data = self._serialize_data(data)

        super().write(data, meta)
        self.cnt.info.append(type_)

    def read(self, index, n_samples):

        # get the entries as raw bytes from the superclass implementation
        entries = super().read(index, n_samples)

        res = []
        for i, entry in enumerate(entries):
            data, meta = entry
            type_ = self.cnt.info[index+i]

            if isinstance(type_, tuple):
                # If the type is a pair (x,y), deserialize independently
                buf = io.BytesIO(data)

                # First, get the position of the second item from the header
                pos, = struct.unpack('<Q', buf.read(8))

                # Read the first and second item
                data1 = buf.read(pos)
                data2 = buf.read()

                # Then deserialize the independently.
                data1 = self._deserialize(data1, type_[0])
                data2 = self._deserialize(data2, type_[1])

                res.append(((data1, data2), meta))
            else:
                data = self._deserialize(data, type_)
                res.append((data, meta))

        return res

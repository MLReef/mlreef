from vergeml.img import INPUT_PATTERNS, open_image, fixext, ImageType
from vergeml.io import source, SourcePlugin, Sample
from vergeml.data import Labels
from vergeml.utils import VergeMLError
from vergeml.sources.labeled_image import LabeledImageSource
import random
import numpy as np
from PIL import Image
import os.path
import json
from operator import methodcaller
import io
from typing import List
import gzip
import hashlib

_FILES = ("train-images-idx3-ubyte.gz", "train-labels-idx1-ubyte.gz",
          "t10k-images-idx3-ubyte.gz", "t10k-labels-idx1-ubyte.gz")


_MNIST_LABELS = ("0", "1", "2", "3", "4", "5", "6", "7", "8", "9")

_FASHION_MNIST_LABELS = ("tshirt_top",
                         "trouser",
                         "pullover",
                         "dress",
                         "coat",
                         "sandal",
                         "shirt",
                         "sneaker",
                         "sag",
                         "ankle_boot")

# we use the md5 to check for fashion mnist, so we can provide the labels
# automatically
_MD5_FASHION = "8d4fb7e6c68d591d4c3dfef9ec88bf0d"


def _md5(fname):
    hash_md5 = hashlib.md5()
    with open(fname, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()


@source('image', descr="Load images in MNIST format.")
class InputMnist(SourcePlugin):
    data = None

    def num_samples(self, split: str) -> int:
        return len(self.data[split])

    def read_sample(self, split: str, index: int):
        return self.data[split][index]

    def _check_files(self):
        self.data = dict(train=[], val=[], test=[])

        samples_dir = self.config["samples_dir"]
        files = [os.path.join(samples_dir, file) for file in _FILES]

        for path in files:
            if not os.path.exists(path):
                raise VergeMLError("File not found in samples_dir: {}".format(
                    os.path.basename(path)))

        if _md5(files[0]) == _MD5_FASHION:
            self.meta['labels'] = _FASHION_MNIST_LABELS
        else:
            self.meta['labels'] = _MNIST_LABELS

        # preload
        for split, images, labels in (('train', files[0], files[1]), ('test', files[2], files[3])):

            with gzip.open(images) as f:
                # First 16 bytes are magic_number, n_imgs, n_rows, n_cols
                pixels = np.frombuffer(f.read(), 'B', offset=16)
                pixels = pixels.reshape(-1, 28, 28)

            with gzip.open(labels) as f:
                # First 8 bytes are magic_number, n_labels
                integer_labels = np.frombuffer(f.read(), 'B', offset=8)

            n_cols = integer_labels.max() + 1

            for ix, imagearr in enumerate(pixels):
                label = integer_labels[ix]
                onehot = np.zeros((n_cols), dtype='float32')
                onehot[label] = 1.0
                self.data[split].append((Image.fromarray(imagearr), onehot,
                                         dict(labels=self.meta['labels'],
                                              filename=images,
                                              split=split,
                                              types=('pil', 'labels'))))

            if split == 'train':
                n = self.config['val_num']

                if self.config['val_perc'] is not None:
                    n = int(len(self.data['train']) * self.config['val_perc'] // 100)
                if n is not None:
                    if n > len(self.data['train']):
                        raise VergeMLError("number of test samples is greater than number of available samples.")

                    rng = random.Random(self.config['random_seed'])
                    count = len(self.data[split])
                    indices = rng.sample(range(count), count)
                    self.data['val'] = [self.data['train'][i] for i in indices[:n]]
                    self.data['train'] = [self.data['train'][i] for i in indices[n:]]

            else:

                if self.config['test_num']:
                    if self.config['test_num'] > len(self.data['test']):
                        raise VergeMLError("number of test samples is greater than number of available samples.")

                    rng = random.Random(self.config['random_seed'])
                    indices = rng.sample(range(len(self.data[split])), len(pixels))
                    self.data['test'] = [self.data['test'][i] for i in indices[:n]]


plugin = InputMnist

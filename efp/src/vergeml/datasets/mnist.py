from vergeml.utils import download_files
from vergeml.utils import Error
import shutil
import os.path
import zipfile
import tarfile


def download(env):
    """The MNIST database of handwritten digits.

The MNIST database of handwritten digits has a training set of
60,000 examples, and a test set of 10,000 examples. It is a
subset of a larger set available from NIST. The digits have been
size-normalized and centered in a fixed-size image.

It is a good database for people who want to try learning
techniques and pattern recognition methods on real-world data
while spending minimal efforts on preprocessing and formatting.

Authors:
  Yann LeCun, Courant Institute, NYU
  Corinna Cortes, Google Labs, New York
  Christopher J.C. Burges, Microsoft Research, Redmond

For more information visit:http://yann.lecun.com/exdb/mnist/"""

    urls = ["http://yann.lecun.com/exdb/mnist/train-images-idx3-ubyte.gz",
            "http://yann.lecun.com/exdb/mnist/train-labels-idx1-ubyte.gz",
            "http://yann.lecun.com/exdb/mnist/t10k-images-idx3-ubyte.gz",
            "http://yann.lecun.com/exdb/mnist/t10k-labels-idx1-ubyte.gz"]

    samples_dir = env.get('base.samples_dir')
    print("Downloading mnist to {}.".format(samples_dir))

    src_dir = download_files(urls, dir=env.get('base.cache_dir'))

    for file in ("train-images-idx3-ubyte.gz", "train-labels-idx1-ubyte.gz",
                 "t10k-images-idx3-ubyte.gz", "t10k-labels-idx1-ubyte.gz"):
        shutil.copy(os.path.join(src_dir, file), samples_dir)

    shutil.rmtree(src_dir)

    print("Finished downloading mnist.")


download.__info__ = [
    ('Samples', '60K'),
    ('Test Samples', '10K'),
    ('Type', 'Labeled Images'),
    ('Resolution', '28x28 grayscale'),
    ('Size', '12 MB')
]

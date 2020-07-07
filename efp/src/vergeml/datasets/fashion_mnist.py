from vergeml.utils import download_files
from vergeml.utils import Error
import shutil
import os.path
import zipfile
import tarfile


def download(env):
    """A MNIST-like fashion product database.

Fashion-MNIST is a dataset of Zalando's article images—
consisting of a training set of 60,000 examples and a test set
of 10,000 examples. Each example is a 28x28 grayscale image,
associated with a label from 10 classes. We intend Fashion-MNIST
to serve as a direct drop-in replacement for the original MNIST
dataset for benchmarking machine learning algorithms. It shares
the same image size and structure of training and testing splits.

Authors:
  Han Xiao
  Kashif Rasul
  Roland Vollgraf

See also:
  Fashion-MNIST: a Novel Image Dataset for Benchmarking Machine
  Learning Algorithms. arXiv:1708.07747
  https://arxiv.org/abs/1708.07747

For more information visit:
https://github.com/zalandoresearch/fashion-mnist"""

    urls = ["http://fashion-mnist.s3-website.eu-central-1.amazonaws.com/train-images-idx3-ubyte.gz",
            "http://fashion-mnist.s3-website.eu-central-1.amazonaws.com/train-labels-idx1-ubyte.gz",
            "http://fashion-mnist.s3-website.eu-central-1.amazonaws.com/t10k-images-idx3-ubyte.gz",
            "http://fashion-mnist.s3-website.eu-central-1.amazonaws.com/t10k-labels-idx1-ubyte.gz"]

    samples_dir = env.get('base.samples_dir')
    print("Downloading fashion mnist to {}.".format(samples_dir))

    src_dir = download_files(urls, dir=env.get('base.cache_dir'))

    for file in ("train-images-idx3-ubyte.gz", "train-labels-idx1-ubyte.gz",
                 "t10k-images-idx3-ubyte.gz", "t10k-labels-idx1-ubyte.gz"):
        shutil.copy(os.path.join(src_dir, file), samples_dir)

    shutil.rmtree(src_dir)

    print("Finished downloading fashion mnist.")


download.__info__ = [
    ('Samples', '60K'),
    ('Test Samples', '10K'),
    ('Type', 'Labeled Images'),
    ('Resolution', '28x28 grayscale'),
    ('Size', '30 MB')
]

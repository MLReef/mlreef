from vergeml.utils import download_files
from vergeml.utils import Error
import shutil
import os.path
import zipfile
import tarfile


def download(env):
    """60000 tiny colour images in 10 classes.

The CIFAR-10 dataset consists of 60000 32x32 colour images in 10 
classes, with 6000 images per class. There are 50000 training 
images and 10000 test images.

Credits:
  Alex Krizhevsky
  Vinod Nair
  Geoffrey Hinton

For more information visit: 
https://www.cs.toronto.edu/~kriz/cifar.html"""

    url = "https://www.cs.toronto.edu/~kriz/cifar-10-python.tar.gz"

    samples_dir = env.get('base.samples_dir')

    print("Downloading CIFAR-10 to {}.".format(samples_dir))

    src_dir = download_files([url], dir=env.get('base.cache_dir'))
    path = os.path.join(src_dir, "cifar-10-python.tar.gz")

    tarf = tarfile.TarFile(path, 'r:gz')
    tarf.extractall(src_dir)
    tarf.close()

    shutil.rmtree(src_dir)

    print("Finished downloading CIFAR-10.")


download.__info__ = [
    ('Samples', '60000'),
    ('Type', 'Images'),
    ('Resolution', '32x32 RGB'),
    ('Size', '163 MB')
]

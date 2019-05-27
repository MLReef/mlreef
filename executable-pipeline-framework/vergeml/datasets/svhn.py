from vergeml.utils import download_files
from vergeml.utils import Error
import shutil
import os.path
import zipfile
import tarfile


def download(env):
    """The Street View House Numbers (SVHN) Dataset.

SVHN is a real-world image dataset for developing machine 
learning and object recognition algorithms with minimal 
requirement on data preprocessing and formatting. It can be 
seen as similar in flavor to MNIST (e.g., the images are of 
small cropped digits), but incorporates an order of magnitude 
more labeled data (over 600,000 digit images) and comes from a 
significantly harder, unsolved, real world problem 
(recognizing digits and numbers in natural scene images). SVHN
 is obtained from house numbers in Google Street View images.



Authors:
  Yuval Netzer, Tao Wang, Adam Coates, Alessandro Bissacco, 
  Bo Wu, Andrew Y. Ng 
  Reading Digits in Natural Images with Unsupervised Feature 
  Learning NIPS Workshop on Deep Learning and Unsupervised 
  Feature Learning 2011. 

  http://ufldl.stanford.edu/housenumbers/nips2011_housenumbers.pdf

For more information visit: http://ufldl.stanford.edu/housenumbers/"""

    urls = ["http://ufldl.stanford.edu/housenumbers/train_32x32.mat",
            "http://ufldl.stanford.edu/housenumbers/test_32x32.mat"]

    samples_dir = env.get('base.samples_dir')
    print("Downloading SVHN to {}.".format(samples_dir))

    src_dir = download_files(urls, dir=env.get('base.cache_dir'))

    for file in ("train_32x32.mat", "test_32x32.mat", ):
        shutil.copy(os.path.join(src_dir, file), samples_dir)

    shutil.rmtree(src_dir)

    print("Finished downloading SVHN.")


download.__info__ = [
    ('Samples', '73K'),
    ('Test Samples', '26K'),
    ('Type', 'Labeled Images'),
    ('Resolution', '32x32 rgb'),
    ('Size', '235.3 MB')
]

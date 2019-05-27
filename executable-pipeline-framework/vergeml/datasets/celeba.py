from vergeml.utils import download_files
from vergeml.utils import Error
import shutil
import os.path
import zipfile
import tarfile
import urllib.request


def download(env):
    """Large-scale CelebFaces Attributes.

CelebFaces Attributes Dataset (CelebA) is a large-scale face 
attributes dataset with more than 200K celebrity images.

Credits:
   Ziwei Liu   
   Ping Luo   
   Xiaogang Wang   
   Xiaoou Tang
   Multimedia Laboratory, The Chinese University of Hong Kong 

For more information visit:
http://mmlab.ie.cuhk.edu.hk/projects/CelebA.html"""

    samples_dir = env.get('base.samples_dir')

    print("Downloading celeba to {}.".format(samples_dir))

    url = "https://drive.google.com/uc?id=0B7EVK8r0v71pZjFTYXZWM3FlRnM&export=download"

    token = None
    fp = urllib.request.urlopen(url)
    info = fp.info()
    fp.close()

    cookies = info.get("Set-Cookie")

    for cookie in cookies.split(";"):
        if cookie.startswith("download_warning"):
            _, token = cookie.split("=")
            token = token.strip()
            break

    if not token:
        raise Error("Could not get google drive download token.")

    url = "https://drive.google.com/uc?export=download&confirm={}&id=0B7EVK8r0v71pZjFTYXZWM3FlRnM".format(token)

    src_dir = download_files([(url, "img_align_celeba.zip")], headers=[('Cookie', cookies)], dir=env.get('base.cache_dir'))

    path = os.path.join(src_dir, "img_align_celeba.zip")

    print("Extracting data.")

    zipf = zipfile.ZipFile(path, 'r')
    zipf.extractall(src_dir)
    zipf.close()

    for src_file in os.listdir(os.path.join(src_dir, "img_align_celeba")):
        if src_file.startswith("."):
            continue

        shutil.copy(os.path.join(src_dir, "img_align_celeba", src_file), samples_dir)

    shutil.rmtree(src_dir)

    print("Finished downloading celeba.")


download.__info__ = [
    ('Samples', '202,599'),
    ('Type', 'Labeled Images'),
    ('Size', '1.44 GB')
]


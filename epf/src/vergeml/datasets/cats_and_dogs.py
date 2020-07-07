from vergeml.utils import VergeMLError
from vergeml.dataset import DatasetPlugin, dataset
from vergeml.display import DISPLAY
import shutil
import os.path
import zipfile
import tarfile

_LONG_DESCR = """
25K images of cats and dogs.

Credits:
  Jeremy Elson, John R. Douceur, Jon Howell, Jared Saul, Asirra:
  A CAPTCHA that Exploits Interest-Aligned Manual Image
  Categorization, in Proceedings of 14th ACM Conference on Computer
  and Communications Security (CCS), Association for Computing
  Machinery, Inc., Oct. 2007

For more information visit https://www.kaggle.com/c/dogs-vs-cats
""".strip()

_INFO = [
    ['Samples', '25K'],
    ['Type', 'Labeled Images'],
    ['Size', '786.7 MB']
]

_LONG_DESCR += "\n\n" + DISPLAY.table(_INFO, separate='none').getvalue()

_URL = "https://download.microsoft.com/download/3/E/1/3E1C3F21-ECDB-4869-8368-6DEBA77B919F/kagglecatsanddogs_3367a.zip"

@dataset('cats-and-dogs', descr="25K images of cats and dogs.", long_descr=_LONG_DESCR)
class CatsAndDogsDataset(DatasetPlugin):

    def __call__(self, args, env):
        samples_dir = env.get('samples-dir')
        for label in ("cat", "dog"):
            dest = os.path.join(samples_dir, label)
            if os.path.exists(dest):
                raise VergeMLError("Directory {} already exists in samples dir: {}".format(label, dest))
        print("Downloading cats and dogs to {}.".format(samples_dir))
        src_dir = self.download_files([(_URL, "catsdogs.zip")], env)
        path = os.path.join(src_dir, "catsdogs.zip")

        print("Extracting data.")
        zipf = zipfile.ZipFile(path, 'r')
        zipf.extractall(src_dir)
        zipf.close()

        for file, dest in (("PetImages/Dog", "dog"), ("PetImages/Cat", "cat")):
            shutil.copytree(os.path.join(src_dir, file), os.path.join(samples_dir, dest))

        shutil.rmtree(src_dir)

        # WTF?
        os.unlink(os.path.join(samples_dir, "cat", "666.jpg"))
        os.unlink(os.path.join(samples_dir, "dog", "11702.jpg"))

        print("Finished downloading cats and dogs.")

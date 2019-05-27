from vergeml.utils import VergeMLError
from vergeml.dataset import DatasetPlugin, dataset
from vergeml.display import DISPLAY
import shutil
import os.path
import zipfile
import tarfile


_LONG_DESCR = """2400 objects of distinct categories.

Credits:
  Brady, T. F., Konkle, T., Alvarez, G. A. and Oliva, A. (2008). 
  Visual long-term memory has a massive storage capacity for 
  object details. Proceedings of the National Academy of 
  Sciences, USA, 105 (38), 14325-14329.
  http://cvcl.mit.edu/MM/pdfs/BradyKonkleAlvarezOliva2008.pdf

For more information visit: 
http://cvcl.mit.edu/MM/uniqueObjects.html""".strip()

_INFO = [
    ['Samples', '2400'],
    ['Type', 'Images'],
    ['Resolution', '256x256 RGB'],
    ['Size', '67.8 MB']
]


_LONG_DESCR += "\n\n" + DISPLAY.table(_INFO, separate='none').getvalue()

_URL = "http://cvcl.mit.edu/MM/downloads/ObjectsAll.zip"

@dataset('unique-objects', descr="2400 objects of distinct categories.", long_descr=_LONG_DESCR)
class UniqueObjectsDataset(DatasetPlugin):

    def __call__(self, args, env):
        samples_dir = env.get('samples-dir')

        print("Downloading unique objects to {}.".format(samples_dir))

        src_dir = self.download_files([_URL], env=env, dir=env.get('cache-dir'))
        path = os.path.join(src_dir, "ObjectsAll.zip")

        zipf = zipfile.ZipFile(path, 'r')
        zipf.extractall(src_dir)
        zipf.close()

        for file in os.listdir(os.path.join(src_dir, "OBJECTSALL")):
            shutil.copy(os.path.join(src_dir, "OBJECTSALL", file), samples_dir)

        shutil.rmtree(src_dir)

        print("Finished downloading unique objects.")

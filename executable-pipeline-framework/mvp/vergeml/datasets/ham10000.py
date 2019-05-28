from vergeml.utils import VergeMLError
from vergeml.dataset import DatasetPlugin, dataset
from vergeml.display import DISPLAY
import shutil
import os.path
import zipfile
import tarfile
import json
import urllib.parse
import glob
import csv

_LONG_DESCR = """
A Large Collection of Dermatoscopic Images of Common Pigmented Skin Lesions

The "Human Against Machine with 10000 training images" dataset is a collection of
dermatoscopic images from different populations acquired and stored by different 
modalities. It was created by applying different acquisition and cleaning methods.
The final dataset consists of 10010 dermatoscopic images. This benchmark dataset 
can be used for machine learning and for comparisons with human experts. Cases 
include a representative collection of all important diagnostic categories in the 
realm of pigmented lesions. More than 50% of lesions have been confirmed by pathology, 
the ground truth for the rest of the cases was either follow-up, expert consensus, 
or confirmation by in-vivo confocal microscopy.
""".strip()

_INFO = [
    ['Samples', '10K'],
    ['Type', 'Labeled Images'],
    ['Size', '2.5G']
]

_LONG_DESCR += "\n\n" + DISPLAY.table(_INFO, separate='none').getvalue()

_URL = "https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/DBW86T"
_URL1 = "https://dataverse.harvard.edu/api/access/datafile/3172585?gbrecs=true"
_URL2 = "https://dataverse.harvard.edu/api/access/datafile/3172584?gbrecs=true"
_URL3 = "https://dataverse.harvard.edu/api/access/datafile/3172582?format=original&gbrecs=true"


@dataset('ham10000', descr="Dermatoscopic images of skin lesions.", long_descr=_LONG_DESCR)
class Ham10KDataset(DatasetPlugin):
    
    def __call__(self, args, env):
        samples_dir = env.get('samples-dir')

        print("Downloading HAM10000 to {}.".format(samples_dir))

        jsessionid = None
        fp = urllib.request.urlopen(_URL)
        info = fp.info()
        fp.close()

        cookies = info.get("Set-Cookie")

        for cookie in cookies.split(";"):
            if cookie.startswith("JSESSIONID"):
                _, jsessionid = cookie.split("=")
                jsessionid = jsessionid.strip()
                break

        if not jsessionid:
            raise VergeMLError("Could not get jsessionid.")
        
        files = [(_URL1, "ham10000_1.zip"), (_URL2, "ham10000_2.zip"), (_URL3, "meta.csv")]
     
        src_dir = self.download_files(files, env=env, headers=[('Cookie', cookies)], dir=env.get('cache-dir'))

        print("")
        print("Extracting data...")
        for fname in ("ham10000_1.zip", "ham10000_2.zip"):
            path = os.path.join(src_dir, fname)
            zipf = zipfile.ZipFile(path, 'r')
            zipf.extractall(src_dir)
            zipf.close()
        
        meta_path = os.path.join(src_dir, "meta.csv")
        
        with open(meta_path, 'r') as csvfile:
            csv_reader = csv.reader(csvfile)
            header = True
            
            for row in csv_reader:
                if header:
                    header = False
                    continue
                [_lesion_id, image_id, dx, _dx_type, _age, _sex, _localization] = row

                dirname = os.path.join(samples_dir, dx)
                if not os.path.exists(dirname):
                    os.makedirs(dirname)

                shutil.copy(os.path.join(src_dir, image_id + ".jpg"), os.path.join(samples_dir, dx, image_id + ".jpg"))
        
        shutil.copy(os.path.join(src_dir, "meta.csv"), os.path.join(samples_dir, "meta.csv"))
        
        shutil.rmtree(src_dir)
        print("Finished downloading HAM10000.")

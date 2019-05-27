from vergeml.utils import VergeMLError
from vergeml.dataset import DatasetPlugin, dataset
from vergeml.display import DISPLAY
import shutil
import os.path
import zipfile
import tarfile

_LONG_DESCR = """Stanford dogs dataset for fine-grained visual categorization.

The Stanford Dogs dataset contains images of 120 breeds of dogs 
from around the world. This dataset has been built using images 
and annotation from ImageNet for the task of fine-grained image 
categorization.

Credits:
  Aditya Khosla, Nityananda Jayadevaprakash, Bangpeng Yao and 
  Li Fei-Fei. Novel dataset for Fine-Grained Image Categorization. 
  First Workshop on Fine-Grained Visual Categorization (FGVC), IEEE 
  Conference on Computer Vision and Pattern Recognition (CVPR), 2011. 
  http://people.csail.mit.edu/khosla/papers/fgvc2011.pdf

  J. Deng, W. Dong, R. Socher, L.-J. Li, K. Li and L. Fei-Fei, 
  ImageNet: A Large-Scale Hierarchical Image Database. IEEE Computer 
  Vision and Pattern Recognition (CVPR), 2009.
  http://www.image-net.org/papers/imagenet_cvpr09.pdf

For more information visit: 
http://vision.stanford.edu/aditya86/ImageNetDogs/""".strip()

_INFO = [
    ['Samples', '20,580'],
    ['Type', 'Labeled Images'],
    ['Size', '757 MB'],
]

_LONG_DESCR += "\n\n" + DISPLAY.table(_INFO, separate='none').getvalue()

_URL = "http://vision.stanford.edu/aditya86/ImageNetDogs/images.tar"

@dataset('dogs', descr="Stanford dogs dataset for fine-grained visual categorization.", long_descr=_LONG_DESCR)
class DogsDataset(DatasetPlugin):

    def __call__(self, args, env):
        samples_dir = env.get('samples-dir')

        for label in ['affenpinscher', 'afghan-hound', 'african-hunting-dog', 'airedale', 'american-staffordshire-terrier', 'appenzeller', 'australian-terrier', 'basenji', 'basset', 'beagle', 'bedlington-terrier', 'bernese-mountain-dog', 'black-and-tan-coonhound', 'blenheim-spaniel', 'bloodhound', 'bluetick', 'border-collie', 'border-terrier', 'borzoi', 'boston-bull', 'bouvier-des-flandres', 'boxer', 'brabancon-griffon', 'briard', 'brittany-spaniel', 'bull-mastiff', 'cairn', 'cardigan', 'chesapeake-bay-retriever', 'chihuahua', 'chow', 'clumber', 'cocker-spaniel', 'collie', 'curly-coated-retriever', 'dandie-dinmont', 'dhole', 'dingo', 'doberman', 'english-foxhound', 'english-setter', 'english-springer', 'entlebucher', 'eskimo-dog', 'flat-coated-retriever', 'french-bulldog', 'german-shepherd', 'german-short-haired-pointer', 'giant-schnauzer', 'golden-retriever', 'gordon-setter', 'great-dane', 'great-pyrenees', 'greater-swiss-mountain-dog', 'groenendael', 'ibizan-hound', 'irish-setter', 'irish-terrier', 'irish-water-spaniel', 'irish-wolfhound', 'italian-greyhound', 'japanese-spaniel', 'keeshond', 'kelpie', 'kerry-blue-terrier', 'komondor', 'kuvasz', 'labrador-retriever', 'lakeland-terrier', 'leonberg', 'lhasa', 'malamute', 'malinois', 'maltese-dog', 'mexican-hairless', 'miniature-pinscher', 'miniature-poodle', 'miniature-schnauzer', 'newfoundland', 'norfolk-terrier', 'norwegian-elkhound', 'norwich-terrier', 'old-english-sheepdog', 'otterhound', 'papillon', 'pekinese', 'pembroke', 'pomeranian', 'pug', 'redbone', 'rhodesian-ridgeback', 'rottweiler', 'saint-bernard', 'saluki', 'samoyed', 'schipperke', 'scotch-terrier', 'scottish-deerhound', 'sealyham-terrier', 'shetland-sheepdog', 'shih-tzu', 'siberian-husky', 'silky-terrier', 'soft-coated-wheaten-terrier', 'staffordshire-bullterrier', 'standard-poodle', 'standard-schnauzer', 'sussex-spaniel', 'tibetan-mastiff', 'tibetan-terrier', 'toy-poodle', 'toy-terrier', 'vizsla', 'walker-hound', 'weimaraner', 'welsh-springer-spaniel', 'west-highland-white-terrier', 'whippet', 'wire-haired-fox-terrier', 'yorkshire-terrier']:
            dest = os.path.join(samples_dir, label)
            if os.path.exists(dest):
                raise VergeMLError("Directory {} already exists in samples dir: {}".format(label, dest))

        print("Downloading Stanford dogs to {}.".format(samples_dir))

        src_dir = self.download_files([_URL], env=env, dir=env.get('cache-dir'))
        path = os.path.join(src_dir, "images.tar")

        print("Extracting data...")

        tarf = tarfile.TarFile(path, 'r')
        tarf.extractall(src_dir)
        tarf.close()

        for src_file in os.listdir(os.path.join(src_dir, "Images")):
            if src_file.startswith("."):
                continue

            _, dest_file = src_file.split("-", maxsplit=1)
            dest_file = dest_file.replace("_", "-")
            dest_file = dest_file.lower()
            shutil.copytree(os.path.join(src_dir, "Images", src_file),
                            os.path.join(samples_dir, dest_file))

        shutil.rmtree(src_dir)

        print("Finished downloading Stanford dogs.")

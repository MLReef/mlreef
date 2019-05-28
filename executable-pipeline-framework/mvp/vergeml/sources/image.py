from vergeml.img import INPUT_PATTERNS, open_image, fixext
from vergeml.io import source, SourcePlugin, Sample
import random
import numpy as np
from PIL import Image
import os.path

@source('image', descr="Load image files.", input_patterns=INPUT_PATTERNS)
class ImageSource(SourcePlugin):
    input_patterns = INPUT_PATTERNS

    def __init__(self, config: dict={}):
        self.files = None
        super().__init__(config)
            
    def begin_read_samples(self):
        if self.files:
            return
        
        self.files = self.scan_and_split_files()

    def num_samples(self, split: str) -> int:
        return len(self.files[split])

    def read_samples(self, split, index, n=1):
        items = self.files[split][index:index+n]
        items = [(open_image(filename), meta) for filename, meta in items]
        
        res = []
        for img, meta in items:
            rng = random.Random(str(self.random_seed) + meta['filename'])
            res.append(Sample(img, None, meta.copy(), rng)) 

        return res

    def transform(self, sample):
        sample.x = np.asarray(sample.x)
        sample.y = None
        return sample

    def hash(self, state: str) -> str:
        return super().hash(state + self.hash_files(self.files))
    
    def supports_preview(self):
        return True
    
    def write_preview(self, output_dir: str, split: str, sample: Sample):
        filename = sample.meta['filename']
        
        name = fixext(os.path.basename(filename), sample.x)
        split_dir = os.path.join(output_dir, split)
        if not os.path.exists(split_dir):
            os.makedirs(split_dir)

        path = self.preview_filename(os.path.join(split_dir, name))
        sample.x.save(path)
        return path

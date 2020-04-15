# MLReef-2020: add noise for data augmentation.
import argparse
import sys
import os
from pathlib import Path
from skimage import io, util
import numpy as np


class AddNoise:

    def __init__(self,params):
        self.input_dir = params['input_path']
        self.output_dir = params['output_path']
        self.mode = params['mode']

        # create folder if does not exists
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

        # Please add here the extensions that you need
        self.ext = ['.jpeg', '.png', '.jpg']

    def __execute__(self):
        # Walk the directories to find images
        for root, dirs, files in os.walk(self.input_dir):
            for file in files:
                if file.endswith(tuple(self.ext)):
                    image = os.path.join(root, file)
                    fullpath, extension = os.path.splitext(image)
                    im = io.imread(image) / 255.0
                    im_noisy = util.random_noise(im.astype(np.float), mode=self.mode)
                    im_noisy=im_noisy*255
                    relative_p = os.path.relpath(fullpath, self.input_dir)
                    folders = os.path.split(relative_p)[0]
                    Path(os.path.join(self.output_dir, folders)).mkdir(parents=True, exist_ok=True)
                    io.imsave(os.path.join(self.output_dir, '{}_noise{}'.format(relative_p, extension)), im_noisy.astype(np.uint8))
        print("Add noise done")
        return 1



def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Add Noise')
    parser.add_argument('--input-path', action='store', default='.', help='path to directory of images or image file')
    parser.add_argument('--output-path', action='store', default='.', help='output directory to save images')
    parser.add_argument('--mode', action='store', default='gaussian',
                        help='gaussian | localvar | poisson | salt | pepper | speckle')
    params = vars(parser.parse_args(args))
    if (params['input_path'] or params['output_path']) is None:
        parser.error("Paths are required. You did not specify input path or output path.")
    return params


if __name__ == "__main__":
    print("Beginning execution of im_add_noise.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    op = AddNoise(params)
    print("input path:", op.input_dir)
    print("output path:", op.output_dir)
    print("Mode", op.mode)
    op.__execute__()



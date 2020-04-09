# MLReef-2020: add noise for data augmentation.
import argparse
import sys
import os
from pathlib import Path
from skimage import io, util


def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Add Noise')
    parser.add_argument('--input-path', action='store', default='.', help='path to directory of images or image file')
    parser.add_argument('--output-path', action='store', default='.', help='output directory to save images')
    parser.add_argument('--mode', action='store', default='gaussian',
                        help='gaussian | localvar | poisson | salt | pepper | speckle')
    params = vars(parser.parse_args(args))
    return params


if __name__ == "__main__":
    print("Beginning execution of im_create_thumbnail.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    print(params)
    input_dir = params['input_path']
    output_dir = params['output_path']
    mode = params['mode']

    # create folder if does not exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Please add here the extensions that you need
    ext = ['.jpeg', '.png', '.jpg']

    # Walk the directories to find images
    for root, dirs, files in os.walk(input_dir):
        for file in files:
            if file.endswith(tuple(ext)):
                image = os.path.join(root, file)
                fullpath, extension = os.path.splitext(image)
                im = io.imread(image) / 255.0
                im_noisy = util.random_noise(im, mode=mode)
                relative_p = os.path.relpath(fullpath, input_dir)
                folders = os.path.split(relative_p)[0]
                Path(os.path.join(output_dir, folders)).mkdir(parents=True, exist_ok=True)
                io.imsave(os.path.join(output_dir, '{}_noise{}'.format(relative_p, extension)), im_noisy)

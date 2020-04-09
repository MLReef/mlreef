# MLReef-2020: Affine distortion for data augmentation
import argparse
import sys
import os
import numpy as np
from pathlib import Path
from skimage import io, util, transform


# Numpy based tranformation
def distort_affine_skimage(image, rotation=10.0, shear=5.0):
    rot = np.deg2rad(np.random.uniform(-rotation, rotation))
    sheer = np.deg2rad(np.random.uniform(-shear, shear))

    shape = image.shape
    shape_size = shape[:2]
    center = np.float32(shape_size) / 2. - 0.5

    pre = transform.SimilarityTransform(translation=-center)
    affine = transform.AffineTransform(rotation=rot, shear=sheer, translation=center)
    tform = pre + affine

    distorted_image = transform.warp(image, tform.params, mode='reflect')
    final_image = 255 * distorted_image

    return final_image.astype(np.uint8)


def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Add Noise')
    parser.add_argument('--input-path', action='store', default='.', help='path to directory of images or image file')
    parser.add_argument('--output-path', action='store', default='.', help='output directory to save images')
    parser.add_argument('--rotation', action='store', default=60, help='Angle of rotation')
    parser.add_argument('--shear', action='store', default=5.0, help='Shear')

    params = vars(parser.parse_args(args))
    return params


if __name__ == "__main__":
    print("Beginning execution of im_create_thumbnail.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    print(params)
    input_dir = params['input_path']
    output_dir = params['output_path']
    rotation = float(params['rotation'])
    shear = float(params['shear'])

    print('Writing images in:', output_dir)

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
                filename = os.path.basename(fullpath)
                im = io.imread(image) / 255.0
                im_distorted = distort_affine_skimage(im, rotation, shear)
                relative_p = os.path.relpath(fullpath, input_dir)
                folders = os.path.split(relative_p)[0]
                Path(os.path.join(output_dir, folders)).mkdir(parents=True, exist_ok=True)
                io.imsave(os.path.join(output_dir, '{}_dstr{}'.format(relative_p, extension)), im_distorted)

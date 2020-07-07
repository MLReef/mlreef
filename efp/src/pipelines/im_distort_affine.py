# MLReef-2020: Affine distortion for data augmentation
import argparse
import sys
import os
import numpy as np
from pathlib import Path
from skimage import io, util, transform

class DistortAffine:

    def __init__(self,params):
        self.input_dir = params['input_path']
        self.output_dir = params['output_path']
        self.rotation = float(params['rotation'])
        self.shear = float(params['shear'])
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
                    filename = os.path.basename(fullpath)
                    im = io.imread(image) / 255.0
                    im_distorted = self.distort_affine_skimage(im)
                    relative_p = os.path.relpath(fullpath, self.input_dir)
                    folders = os.path.split(relative_p)[0]
                    Path(os.path.join(self.output_dir, folders)).mkdir(parents=True, exist_ok=True)
                    io.imsave(os.path.join(self.output_dir, '{}_dstr{}'.format(relative_p, extension)), im_distorted)
        print("Affine Distort done")
        return 1


    # Numpy based tranformation
    def distort_affine_skimage(self,image):
        rot = np.deg2rad(np.random.uniform(-self.rotation, self.rotation))
        sheer = np.deg2rad(np.random.uniform(-self.shear, self.shear))

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
    parser.add_argument('--input-path', action='store', type=str, default='.', help='path to directory of images or image file')
    parser.add_argument('--output-path', action='store', type=str, default='.', help='output directory to save images')
    parser.add_argument('--rotation', action='store', type=float, default=60, help='Angle of rotation')
    parser.add_argument('--shear', action='store', type=float, default=5.0, help='Shear')

    params = vars(parser.parse_args(args))
    return params


if __name__ == "__main__":
    print("Beginning execution of im_distort_affine.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    op = DistortAffine(params)
    print("input path:", op.input_dir)
    print("output path:", op.output_dir)
    print("rotation", op.rotation)
    print("shear",op.shear)
    op.__execute__()





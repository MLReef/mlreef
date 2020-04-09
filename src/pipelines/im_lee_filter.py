# MLReef-2020: Specke noise removal implementation with Opencv only for grayscale images
from scipy.ndimage.filters import uniform_filter
from scipy.ndimage.measurements import variance
import cv2
import os
import sys
from pathlib import Path
import argparse


def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Lee Filter')
    parser.add_argument('--input-path', action='store', help='path to directory of images or image file')
    parser.add_argument('--output-path', action='store', help='path to directory of images processed')
    parser.add_argument('--intensity', default=5, action='store', help='size of window Lee Filter')
    params = vars(parser.parse_args(args))
    return params


def lee_filter(img, intensity):
    img_mean = uniform_filter(img, (intensity, intensity))
    img_sqr_mean = uniform_filter(img ** 2, (intensity, intensity))
    img_variance = img_sqr_mean - img_mean ** 2
    overall_variance = variance(img)
    img_weights = img_variance / (img_variance + overall_variance)
    img_output = img_mean + img_weights * (img - img_mean)
    return img_output


if __name__ == "__main__":
    print("Beginning execution of im_lee_filter.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    input_dir = params['input_path']
    output_dir = params['output_path']
    intensity = int(params['intensity'])

    # Please add here the extensions that you need
    ext = ['.jpeg', '.png', '.jpg']

    # create folder if does not exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Walk the directories to find images
    for root, dirs, files in os.walk(input_dir):
        for file in files:
            if file.endswith(tuple(ext)):
                image = os.path.join(root, file)
                fullpath, extension = os.path.splitext(image)
                img = cv2.imread(image, 0)
                image_despeckeled = lee_filter(img, intensity)
                relative_p = os.path.relpath(fullpath, input_dir)
                folders = os.path.split(relative_p)[0]
                Path(os.path.join(output_dir, folders)).mkdir(parents=True, exist_ok=True)
                cv2.imwrite(os.path.join(output_dir, '{}_fltrd{}'.format(relative_p, extension)), image_despeckeled)

    print("Filtering done")

# MLReef-2020: Random crop for data augmentation.
import cv2
import os
import sys
import argparse
from pathlib import Path
import random


def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Random Crop')
    parser.add_argument('--input-path', action='store', help='path to directory of images or image file')
    parser.add_argument('--output-path', action='store', help='path to save processed images')
    parser.add_argument('--height', action='store', help='height of final cropped image')
    parser.add_argument('--width', action='store', help='width of final cropped image')
    parser.add_argument('--channels', action='store', default=3, help='channels of final cropped image')
    parser.add_argument('--seed', action='store', default=5, help='seed for randomness')
    params = vars(parser.parse_args(args))
    return params


def random_crop(image, crop_height, crop_width):
    height, width, channels = image.shape
    max_x = width - crop_width
    max_y = height - crop_height
    if max_x > 0 and max_y > 0:

        x = random.randint(1, max_x)
        y = random.randint(1, max_y)

        crop = image[y: y + crop_height, x: x + crop_width, :]
    else:
        return image

    return crop


if __name__ == "__main__":

    print("Beginning execution of im_random_crop.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    input_dir = params['input_path']
    output_dir = params['output_path']
    height = int(params['height'])
    width = int(params['width'])
    channels = int(params['channels'])
    seed = int(params['seed'])

    if type(seed) == str:
        seed = int(seed)

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
                img = cv2.imread(image)
                image_cropped = random_crop(img, height, width)
                relative_p = os.path.relpath(fullpath, input_dir)
                folders = os.path.split(relative_p)[0]
                Path(os.path.join(output_dir, folders)).mkdir(parents=True, exist_ok=True)
                cv2.imwrite(os.path.join(output_dir, '{}_cropped{}'.format(relative_p, extension)), image_cropped)

print("Random Crop done")

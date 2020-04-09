# Sample code for image random erasing by MLReef
# Part of the code based on https://github.com/uranusx86/Random-Erasing-tensorflow
import cv2
import math
import os
import sys
import random
from pathlib import Path
import argparse


def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Random erasing')
    parser.add_argument('--input-path', action='store', help='path to directory of images or image file')
    parser.add_argument('--output-path', action='store', help='output directory to save images')
    parser.add_argument('--scale_min', action='store', default=0.3, help='min percentage of area to erase')
    parser.add_argument('--scale_max', action='store', default=0.4, help='max percentage of area to erase')
    parser.add_argument('--ratio', action='store', default=0.3, help='Ratio of area to erase')
    parser.add_argument('--prob', action='store', default=0.2, help='Probability of erase')
    params = vars(parser.parse_args(args))
    return params


def random_erasing(img, prob, sl=0.02, sh=0.4, r1=0.3, mean=[0.5, 0.5, 0.5]):
    height, width, channels = img.shape
    if random.uniform(0, 1) > prob:
        return img

    for attempt in range(100):
        area = height * width

        target_area = random.uniform(sl, sh) * area
        aspect_ratio = random.uniform(r1, 1 / r1)

        h = int(round(math.sqrt(target_area * aspect_ratio)))
        w = int(round(math.sqrt(target_area / aspect_ratio)))

        if w < width and h < height:
            x1 = random.randint(0, height - h)
            y1 = random.randint(0, width - w)
            if channels == 3:
                img[x1:x1 + h, y1:y1 + w, 0] = mean[0]
                img[x1:x1 + h, y1:y1 + w, 1] = mean[1]
                img[x1:x1 + h, y1:y1 + w, 2] = mean[2]
            else:
                img[x1:x1 + h, y1:y1 + w, 0] = mean[0]
            return img

    return img


if __name__ == "__main__":

    print("Beginning execution of im_random_erasing.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    input_dir = params['input_path']
    output_dir = params['output_path']
    sl = (params['scale_min'])
    sh = (params['scale_max'])
    ratio = (params['ratio'])
    probability = float(params['prob'])

    # Please add here the extensions that you need
    ext = ['.jpeg', '.png', '.jpg']

    # create folder if does not exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Walk the directories to find images
    for root, dirs, files in os.walk(input_dir):
        for file in files:
            if file.endswith(tuple(ext)):
                image_path = os.path.join(root, file)
                fullpath, extension = os.path.splitext(image_path)
                image = cv2.imread(image_path)
                image_erased = random_erasing(image, sl, sh, ratio, probability)
                relative_p = os.path.relpath(fullpath, input_dir)
                folders = os.path.split(relative_p)[0]
                Path(os.path.join(output_dir, folders)).mkdir(parents=True, exist_ok=True)
                cv2.imwrite(os.path.join(output_dir, '{}_re{}'.format(relative_p, extension)), image_erased)

    print("Random Erasing done")

# Sample code for image random erasing by MLReef
# Part of the code based on https://github.com/uranusx86/Random-Erasing-tensorflow
import cv2
import math
import os
import sys
import random
from pathlib import Path
import argparse

class RandomErasing:

    def __init__(self,params):
        self.input_dir = params['input_path']
        self.output_dir = params['output_path']
        self.sl = float(params['scale_min'])
        self.sh = float(params['scale_max'])
        self.ratio = float(params['ratio'])
        self.probability = float(params['prob'])
        #replace with the value desired in the erased area
        self.mean=[125,125,125]
        # Please add here the extensions that you need
        self.ext = ['.jpeg', '.png', '.jpg']

        # create folder if does not exists
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    def __execute__(self):
        # Walk the directories to find images
        for root, dirs, files in os.walk(self.input_dir):
            for file in files:
                if file.endswith(tuple(self.ext)):
                    image_path = os.path.join(root, file)
                    fullpath, extension = os.path.splitext(image_path)
                    image = cv2.imread(image_path)
                    image_erased = self.random_erasing(image)
                    relative_p = os.path.relpath(fullpath, self.input_dir)
                    folders = os.path.split(relative_p)[0]
                    Path(os.path.join(self.output_dir, folders)).mkdir(parents=True, exist_ok=True)
                    cv2.imwrite(os.path.join(self.output_dir, '{}_re{}'.format(relative_p, extension)), image_erased)

        print("Random Erasing done")
        return 1

    def random_erasing(self,img):
        height, width, channels = img.shape
        if random.uniform(0, 1) > self.probability:
            return img

        for attempt in range(100):
            area = height * width

            target_area = random.uniform(self.sl, self.sh) * area
            aspect_ratio = random.uniform(self.ratio, 1 / self.ratio)

            h = int(round(math.sqrt(target_area * aspect_ratio)))
            w = int(round(math.sqrt(target_area / aspect_ratio)))

            if w < width and h < height:
                x1 = random.randint(0, height - h)
                y1 = random.randint(0, width - w)
                if channels == 3:
                    img[x1:x1 + h, y1:y1 + w, 0] = self.mean[0]
                    img[x1:x1 + h, y1:y1 + w, 1] = self.mean[1]
                    img[x1:x1 + h, y1:y1 + w, 2] = self.mean[2]
                else:
                    img[x1:x1 + h, y1:y1 + w, 0] = self.mean[0]
                return img

        return img



def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Random erasing')
    parser.add_argument('--input-path', action='store', type=str,help='path to directory of images or image file')
    parser.add_argument('--output-path', action='store', type=str,help='output directory to save images')
    parser.add_argument('--scale_min', action='store', type=float, default=0.1, help='min percentage of area to erase')
    parser.add_argument('--scale_max', action='store',type=float, default=0.2, help='max percentage of area to erase')
    parser.add_argument('--ratio', action='store',type=float, default=0.3, help='Ratio of area to erase')
    parser.add_argument('--prob', action='store', type=float,default=0.9, help='Probability of erase')
    params = vars(parser.parse_args(args))
    if (params['input_path'] or params['output_path']) is None:
        parser.error("Paths are required. You did not specify input path or output path.")
    return params


if __name__ == "__main__":

    print("Beginning execution of im_random_erasing.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    op = RandomErasing(params)
    print(type(params))
    print("input path:", op.input_dir)
    print("output path:", op.output_dir)
    print("scale min:",op.sl)
    print("scale max:",op.sh)
    print("ratio:", op.ratio)
    print("probability:",op.probability)
    op.__execute__()



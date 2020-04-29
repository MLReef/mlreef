# MLReef-2020: Random crop for data augmentation: Useful for learning with local descriptors
import os
import sys
import argparse
from pathlib import Path
import random
import cv2


class RandomCrop:

    def __init__(self,params):
        self.input_dir = params['input_path']
        self.output_dir = params['output_path']
        self.height = int(params['height'])
        self.width = int(params['width'])
        self.seed = int(params['seed'])

        if type(self.seed) == str:
            seed = int(self.seed)

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
                    img = cv2.imread(image)
                    image_cropped = self.random_crop(img)
                    relative_p = os.path.relpath(fullpath, self.input_dir)
                    folders = os.path.split(relative_p)[0]
                    Path(os.path.join(self.output_dir, folders)).mkdir(parents=True, exist_ok=True)
                    cv2.imwrite(os.path.join(self.output_dir,'{}_cropped{}'.format(relative_p,extension)),image_cropped)
        print("Random Crop done")
        return 1

    def random_crop(self,image):
        random.seed(self.seed)
        height, width, channels = image.shape
        max_x = width - self.width
        max_y = height - self.height
        if max_x > 0 and max_y > 0:

            x = random.randint(1, max_x)
            y = random.randint(1, max_y)

            crop = image[y: y + self.height, x: x + self.width, :]
        else:
            return image

        return crop

def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Random Crop')
    parser.add_argument('--input-path', action='store', help='path to directory of images or image file')
    parser.add_argument('--output-path', action='store', help='path to save processed images')
    parser.add_argument('--height', action='store', type=int, help='height of final cropped image')
    parser.add_argument('--width', action='store', type=int, help='width of final cropped image')
    parser.add_argument('--seed', action='store', type=int,default=5, help='seed for randomness')
    params = vars(parser.parse_args(args))
    if (params['input_path'] or params['output_path']) is None:
        parser.error("Paths are required. You did not specify input path or output path.")
    return params


if __name__ == "__main__":

    print("Beginning execution of im_random_crop.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    op = RandomCrop(params)
    print("input path:", op.input_dir)
    print("output path:", op.output_dir)
    print("height", op.height)
    print("width", op.width)
    print("seed", op.seed)
    op  .__execute__()
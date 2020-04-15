# MLReef-2020: Image rotation for data augmentation
import cv2
import os
import sys
import argparse
from pathlib import Path

class Rotate:
    def __init__(self,params):
        self.input_dir = params['input_path']
        self.output_dir = params['output_path']
        self.angle = float(params['angle'])
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
                    height, width, channels = img.shape
                    matrix = cv2.getRotationMatrix2D((width / 2, height / 2), self.angle, 1)
                    image_rotated = cv2.warpAffine(img, matrix, (width, height))
                    relative_p = os.path.relpath(fullpath, self.input_dir)
                    folders = os.path.split(relative_p)[0]
                    Path(os.path.join(self.output_dir, folders)).mkdir(parents=True, exist_ok=True)
                    cv2.imwrite(os.path.join(self.output_dir, '{}_rotated{}'.format(relative_p, extension)), image_rotated)
        print("Rotating done")
        return 1




def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Rotate')
    parser.add_argument('--input-path', action='store', help='path to directory of images')
    parser.add_argument('--output-path', action='store', help='output path to save images')
    parser.add_argument('--angle', default=30, action='store', help='angle of rotation')
    params = vars(parser.parse_args(args))
    return params


if __name__ == "__main__":
    print("Beginning execution of im_rotate.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    op = Rotate(params)
    print(type(params))
    print("input path:", op.input_dir)
    print("output path:", op.output_dir)
    print("angle", op.angle)
    op.__execute__()






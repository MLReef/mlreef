# MLReef-2020: Specke noise removal implementation with Opencv only for grayscale images
from scipy.ndimage.filters import uniform_filter
from scipy.ndimage.measurements import variance
import cv2
import os
import sys
from pathlib import Path
import argparse


class LeeFilter:

    def __init__(self,params):
        self.input_dir = params['input_path']
        self.output_dir = params['output_path']
        self.intensity = int(params['intensity'])

        # Please add here the extensions that you need
        self.ext = ['.jpeg', '.png', '.jpg']

        # create folder if does not exists
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)


    def lee_filter(self,img):
        img_mean = uniform_filter(img, (self.intensity, self.intensity))
        img_sqr_mean = uniform_filter(img ** 2, (self.intensity, self.intensity))
        img_variance = img_sqr_mean - img_mean ** 2
        overall_variance = variance(img)
        img_weights = img_variance / (img_variance + overall_variance)
        img_output = img_mean + img_weights * (img - img_mean)
        return img_output

    def __execute__(self):
        # Walk the directories to find images
        for root, dirs, files in os.walk(self.input_dir):
            for file in files:
                if file.endswith(tuple(self.ext)):
                    image = os.path.join(root, file)
                    fullpath, extension = os.path.splitext(image)
                    img = cv2.imread(image, 0)
                    image_despeckeled = self.lee_filter(img)
                    relative_p = os.path.relpath(fullpath, self.input_dir)
                    folders = os.path.split(relative_p)[0]
                    Path(os.path.join(self.output_dir, folders)).mkdir(parents=True, exist_ok=True)
                    cv2.imwrite(os.path.join(self.output_dir, '{}_fltrd{}'.format(relative_p, extension)), image_despeckeled)
        print("Filtering done")
        return 1

def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Lee Filter')
    parser.add_argument('--input-path', action='store', type=str, help='path to directory of images or image file')
    parser.add_argument('--output-path', action='store', type=str, help='path to directory of images processed')
    parser.add_argument('--intensity', default=5, type=int,action='store', help='size of window Lee Filter')
    params = vars(parser.parse_args(args))
    if (params['input_path'] or params['output_path']) is None:
        parser.error("Paths are required. You did not specify input path or output path.")
    return params


if __name__ == "__main__":
    print("Beginning execution of im_lee_filter.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    op = LeeFilter(params)
    print("input path:", op.input_dir)
    print("output path:", op.output_dir)
    print("intensity", op.intensity)
    op.__execute__()
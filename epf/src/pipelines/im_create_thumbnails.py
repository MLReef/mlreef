# MLReef-2020: Create thumbnails of images.
from PIL import Image
import argparse
import os
import sys


class Thumbnail:

    def __init__(self,params):
        self.input_dir = params['input_path']
        self.output_dir = params['output_path']
        size = int(params['size'])
        self.size = size, size

        # create folder if does not exists
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

        # Please add here the extensions that you need
        self.ext = ['.jpeg', '.png', '.jpg']

    #image transformation method
    def __execute__(self):
        # Walk the directories to find images
        for root, dirs, files in os.walk(self.input_dir):
            for file in files:
                if file.endswith(tuple(self.ext)):
                    image = os.path.join(root, file)
                    fullpath, extension = os.path.splitext(image)
                    filename = os.path.basename(fullpath)
                    im = Image.open(image)
                    ## HERE you can add other image operations and save them
                    im.thumbnail(self.size, Image.ANTIALIAS)
                    im.save(os.path.join(self.output_dir, '{}_resized{}'.format(filename, extension)))
        print("Create thumbnail done")
        return 1


def process_arguments(args):

    parser = argparse.ArgumentParser(description='Pipeline: Create Thumbnails')
    parser.add_argument('--input-path', action='store', type=str, help='path to directory of images or image file')
    parser.add_argument('--output-path', action='store',type=str, help='output directory to save images')
    parser.add_argument('--size', action='store', type=int, default=128, help='size of thumbnail, width = height')
    params = vars(parser.parse_args(args))
    if (params['input_path'] or params['output_path']) is None:
        parser.error("Paths are required. You did not specify input path or output path.")
    return params

if __name__ == "__main__":
    print("Beginning execution of im_create_thumbnail.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    tb = Thumbnail(params)
    print(type(params))
    print("input path:",tb.input_dir)
    print("output path:",tb.output_dir)
    print("size",tb.size)
    tb.__execute__()




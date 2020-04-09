# MLReef-2020: Create thumbnails of images.
from PIL import Image
import argparse
import sys
import os


def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Random erasing')
    parser.add_argument('--input-path', action='store', default='.', help='path to directory of images or image file')
    parser.add_argument('--output-path', action='store', default='.', help='output directory to save images')
    parser.add_argument('--size', action='store', default=128, help='size of thumbnail, width = height')
    params = vars(parser.parse_args(args))
    return params


if __name__ == "__main__":
    print("Beginning execution of im_create_thumbnail.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    input_dir = params['input_path']
    output_dir = params['output_path']
    size = int(params['size'])

    size = size, size

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
                im = Image.open(image)
                ## HERE you can add other image operations and save them
                im.thumbnail(size, Image.ANTIALIAS)
                im.save(os.path.join(output_dir, '{}_resized{}'.format(filename, extension)))

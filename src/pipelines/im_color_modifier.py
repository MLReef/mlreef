# MLReef-2020: Color modifications for data augmentation.
from PIL import Image, ImageEnhance
import argparse
import sys
import os
from pathlib import Path


def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Random erasing')
    parser.add_argument('--input-path', action='store', default='.', help='path to directory of images or image file')
    parser.add_argument('--output-path', action='store', default='.', help='output directory to save images')
    parser.add_argument('--brightness', action='store', default=0.5, help='Brightness value')
    parser.add_argument('--contrast', action='store', default=0.5, help='contrast value')
    parser.add_argument('--saturation', action='store', default=2.0, help='saturation value')
    params = vars(parser.parse_args(args))
    return params


if __name__ == "__main__":
    print("Beginning execution of im_color_modifier.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    input_dir = params['input_path']
    output_dir = params['output_path']
    brightness = float(params['brightness'])
    contrast = float(params['contrast'])
    saturation = float(params['saturation'])

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
                im = Image.open(image)
                enhancer = ImageEnhance.Brightness(im)
                enhanced_im = enhancer.enhance(brightness)
                enhancer = ImageEnhance.Contrast(im)
                enhanced_im = enhancer.enhance(contrast)
                enhancer = ImageEnhance.Color(im)
                enhanced_im = enhancer.enhance(saturation)
                relative_p = os.path.relpath(fullpath, input_dir)
                folders = os.path.split(relative_p)[0]
                Path(os.path.join(output_dir, folders)).mkdir(parents=True, exist_ok=True)
                enhanced_im.save(os.path.join(output_dir, '{}_cm{}'.format(relative_p, extension)))

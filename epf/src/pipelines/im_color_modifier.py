# MLReef-2020: Color modifications for data augmentation.
from PIL import Image, ImageEnhance
import argparse
import sys
import os
from pathlib import Path

class ColorModifier:

    def __init__(self,params):
        self.input_dir = params['input_path']
        self.output_dir = params['output_path']
        self.brightness = float(params['brightness'])
        self.contrast = float(params['contrast'])
        self.saturation = float(params['saturation'])

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
                    im = Image.open(image)
                    enhancer = ImageEnhance.Brightness(im)
                    enhanced_im = enhancer.enhance(self.brightness)
                    enhancer = ImageEnhance.Contrast(enhanced_im)
                    enhanced_im = enhancer.enhance(self.contrast)
                    enhancer = ImageEnhance.Color(enhanced_im)
                    enhanced_im = enhancer.enhance(self.saturation)
                    relative_p = os.path.relpath(fullpath, self.input_dir)
                    folders = os.path.split(relative_p)[0]
                    Path(os.path.join(self.output_dir, folders)).mkdir(parents=True, exist_ok=True)
                    enhanced_im.save(os.path.join(self.output_dir, '{}_cm{}'.format(relative_p, extension)))
        print("Color modifier done")
        return 1


def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Color modifier')
    parser.add_argument('--input-path', action='store', default='.', help='path to directory of images or image file')
    parser.add_argument('--output-path', action='store', default='.', help='output directory to save images')
    parser.add_argument('--brightness', action='store', default=0.5, help='Brightness value')
    parser.add_argument('--contrast', action='store', default=0.5, help='contrast value')
    parser.add_argument('--saturation', action='store', default=2.0, help='saturation value')
    params = vars(parser.parse_args(args))
    if (params['input_path'] or params['output_path']) is None:
        parser.error("Paths are required. You did not specify input path or output path.")
    return params


if __name__ == "__main__":
    print("Beginning execution of im_color_modifier.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    op = ColorModifier(params)
    print("input path:", op.input_dir)
    print("output path:", op.output_dir)
    print("Brightness",op.brightness)
    print("Contrast",op.contrast)
    print("Saturation",op.saturation)
    op.__execute__()


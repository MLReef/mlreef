import os
import sys
import argparse
from cv2 import imread
from keras.preprocessing.image import ImageDataGenerator, array_to_img, img_to_array, load_img

def augment():
    datagen = ImageDataGenerator(
            rotation_range=rotation_range,
            width_shift_range=width_shift_range,
            height_shift_range=height_shift_range,
            rescale=1./255,
            shear_range=shear_range,
            zoom_range=zoom_range,
            horizontal_flip=horizontal_flip,
            fill_mode='nearest')

    if os.path.isfile(input):
        path = '/'.join(input.split('/')[0:-1])
        image = imread(input)  # this is a PIL image
        image_array = img_to_array(image) 
        image_array = image_array.reshape((1,) + image_array.shape)  

        iterator = 0
        for batch in datagen.flow(image_array, batch_size=1, save_to_dir = output, save_prefix='augment', save_format='png'):
            iterator += 1
            if iterator > iterations:
                break  # otherwise the generator would loop indefinitely

    if os.path.isdir(input):
        for subdir, dirs, files in os.walk(input):
            for file in files:
                try:
                    image = imread(os.path.join(subdir,file))
                    image_array = img_to_array(image)  
                    image_array = image_array.reshape((1,) + image_array.shape) 

                    iterator = 0
                    for batch in datagen.flow(image_array, batch_size=1, save_to_dir=output_path, save_prefix='augment', save_format='png'):
                        iterator += 1
                        if iterator >= iterations:
                            break  # otherwise the generator would loop indefinitely
                except Exception as identifier:
                    print("Error:", identifier)
                    pass
            
    return None

def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Augment')
    parser.add_argument('--input-path', action='store', help='path to directory of images')
    parser.add_argument('--output-path', action='store', default='.', help='path to output metrics ')
    parser.add_argument('--iterations', action='store', help='number of augmented images per image in dataset (int)')
    parser.add_argument('--rotation-range', action='store', default=0, help='degree range for random rotations (int)')
    parser.add_argument('--width-shift-range', action='store', default=0, help='float: fraction of total width, if < 1, or pixels if >= 1. 1-D array-like: random elements from the array.int: integer number of pixels from interval (-width_shift_range, +width_shift_range) With width_shift_range=2 possible values are integers [-1, 0, +1], same as with width_shift_range=[-1, 0, +1], while with width_shift_range=1.0 possible values are floats in the interval [-1.0, +1.0).')
    parser.add_argument('--height-shift-range', action='store', default=0, help='same as width shift range')
    parser.add_argument('--shear-range', action='store', default=0, help='shear angle in counter-clockwise direction in degrees (float)')
    parser.add_argument('--zoom-range', action='store', default=0, help='range for random zoom (float)')
    parser.add_argument('--horizontal-flip', action='store', default=False, help='randomly flip inputs horizontally (boolean)')
    parser.add_argument('--vertical-flip', action='store', default=False, help='Randomly flip inputs vertically (boolean)')
    params = vars(parser.parse_args(args))
    return params


if __name__ == "__main__":

    print("Beginning execution of augment.py script ......... \n")    
    params = process_arguments(sys.argv[1:])
    print("Parameters input are: ",params)
    input = params['input_path']
    output_path= params['output_path']
     # create folder if does not exists
    if not os.path.exists(output_path):
        os.makedirs(output_path)
    iterations = int(params['iterations'])
    rotation_range = int(params['rotation_range'])
    width_shift_range = int(params['width_shift_range'])
    height_shift_range = int(params['height_shift_range'])
    shear_range = float(params['shear_range'])
    zoom_range = float(params['zoom_range'])
    horizontal_flip = bool(params['horizontal_flip'])
    vertical_flip = bool(params['vertical_flip'])

    augment()
    print("Augmenting done")
    pass

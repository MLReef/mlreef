import tensorflow as tf
import cv2
import os
import sys
import argparse

tf.compat.v1.disable_eager_execution()

def process_arguments(args):
    parser = argparse.ArgumentParser(description='Pipeline: Lee Filter')
    parser.add_argument('--images-path', action='store', help='path to directory of images or image file')
    parser.add_argument('--height', action='store', help='height of final cropped image')
    parser.add_argument('--width', action='store', help='width of final cropped image')
    parser.add_argument('--channels', action='store', default=3, help='channels of final cropped image')
    parser.add_argument('--seed', action='store', default=None, help='seed for randomness')
    params = vars(parser.parse_args(args))
    return params

if __name__ == "__main__":
    
    print("Beginning execution of random_crop.py script ......... \n")    
    params = process_arguments(sys.argv[1:])
    string = params['images_path']
    height = int(params['height'])
    width = int(params['width'])
    channels = int(params['channels'])
    seed = (params['seed'])

    if type(seed) == str:
        seed = int(seed)
    
    if os.path.isfile(string):
        path = '/'.join(string.split('/')[0:-1])
        image = cv2.imread(string)
        image_cropped = tf.image.random_crop(image,[height,width,channels],seed)
        png = tf.image.encode_png(image_cropped,compression=-1,name=None)
        with tf.compat.v1.Session() as sess:
            sess.run(tf.compat.v1.global_variables_initializer())
            png_data_ = sess.run(png)
            open("{}/{}-{}_{}.png".format(path,string.split('.')[-2].split('/')[-1],height,width), 'wb+').write(png_data_)   

    if os.path.isdir(string):   
        for subdir, dirs, files in os.walk(string):
            for file in files:
                try:
                    image = cv2.imread(os.path.join(subdir,file))
                    image_cropped = tf.image.random_crop(image,[height,width,channels])
                    png = tf.image.encode_png(image_cropped,compression=-1,name=None)
                    with tf.compat.v1.Session() as sess:
                        sess.run(tf.compat.v1.global_variables_initializer())
                        png_data_ = sess.run(png)
                        open("{}/{}-{}_{}.png".format(subdir,file.split('.')[0],height,width), 'wb+').write(png_data_)   
                except Exception as identifier:
                    print("Error:", identifier)
                    pass

    print("Random Crop done")
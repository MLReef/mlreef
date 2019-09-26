from keras.preprocessing.image import ImageDataGenerator, array_to_img, img_to_array, load_img
import os
import sys
from cv2 import imread

pipeline = sys.argv[0]
string = sys.argv[1]   #String to determine file or directory handling
iterations = int(sys.argv[2]) 
path = '/'.join(string.split('/')[0:-1])

if len(sys.argv) >= 4:
    rotation_range = int(sys.argv[3]) 
else: 
    rotation_range = 0 

if len(sys.argv) >= 5:
    width_shift_range = float(sys.argv[4])
else:
    width_shift_range=0.5

if len(sys.argv) >= 6:
    height_shift_range = float(sys.argv[5])
else:
    height_shift_range=0.5

if len(sys.argv) >= 7:
    shear_range = float(sys.argv[6])
else:
    shear_range=0.5

if len(sys.argv) >= 8:
    zoom_range = float(sys.argv[7])
else:
    zoom_range=0.5

if len(sys.argv) == 9:
    horizontal_flip = bool(sys.argv[8])
else:
    horizontal_flip = True

datagen = ImageDataGenerator(
        rotation_range=rotation_range,
        width_shift_range=width_shift_range,
        height_shift_range=height_shift_range,
        rescale=1./255,
        shear_range=shear_range,
        zoom_range=zoom_range,
        horizontal_flip=horizontal_flip,
        fill_mode='nearest')

print("Augmenting files with rotation range: {}, width shift range: {}, height shift range: {}, shear range: {}, zoom range: {} and horizontal flip: {} to {} iterations".format(rotation_range,width_shift_range,height_shift_range,shear_range,zoom_range,horizontal_flip,iterations))

if os.path.isfile(string):
    image = imread(string)  # this is a PIL image
    image_array = img_to_array(image) 
    image_array = image_array.reshape((1,) + image_array.shape)  

    iterator = 0
    for batch in datagen.flow(image_array, batch_size=1, save_to_dir=path, save_prefix='augment', save_format='png'):
        iterator += 1
        if iterator > iterations:
            break  # otherwise the generator would loop indefinitely

if os.path.isdir(string):   
    for file in os.listdir(string):
        image = imread(string+file)
        image_array = img_to_array(image)  
        image_array = image_array.reshape((1,) + image_array.shape) 

        iterator = 0
        for batch in datagen.flow(image_array, batch_size=1, save_to_dir=path, save_prefix='augment', save_format='png'):
            iterator += 1
            if iterator >= iterations:
                break  # otherwise the generator would loop indefinitely

print("Done")
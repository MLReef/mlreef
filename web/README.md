React Web App
=============

This module contains the MLReef frontend web app which is implemented as a [REACT Web App](https://reactjs.org/
). If you choose to use npm for dependency management the following commands have to be executed from with the 
_web_ module folder. For information on gradle commands see the main [README.md](../README.md). 


## Setup
Install all frontend dependencies with via npm: `npm install`

## Run Locally
You can start the frontend separately with npm using the `npm start` command. 

## Frontend production build
To build the frontend project with npm use `npm run build`

## Execution of pipelines

This feature lets user execute pipelines directly from the web interface

First Open the overview and click in "Data pipeline" button.

Next just drag-and-drop the operations to the selection area, type parameters and press in execute button.

## Pipeline Operations

### Lee Filter

The presence of speckle noise in Synthetic Aperture Radar (SAR) images makes the interpretation of the contents difficult, thereby degrading the quality of the image. Therefore an efficient speckle noise removal technique, the Lee Filter is used to smoothen the static-like noise present in these images

#### Standard Parameter(s):
1. intensity(int): The internsity of the filter decided the level of smoothening that will be carried out. Ideal values lie between 2-7. A large value will result in high levels of blurring and might render the image without many features to extract. Must be a non zero positive value

#### Advanced Parameter(s): -

### Augment

Neural network architectures have a large number of trainable parameters and therefore they require a very large number of images to train on to effectively capture the distrubution of the data and 'learn'. Data augmentation is a strategy that enables us to significantly increase the diversity of data available for training models, without actually collecting new data. 

For example, in the case of images, the data is tweaked by changing angle of rotation, flipping the images, zooming in, etc.

#### Standard Parameter(s):  
1. Number of augmented images(int): Multiplying factor which dictates how many augmented images should be output per image in the dataset (inclusive). Must be a positive float value

#### Advanced Parameter(s):  

1. rotation_range (float)
2. width_shift_range(float)
3. height_shift_range(float)
4. shear_range(float)
5. zoom_range(float)
6. horizontal_flip(bool)


### Rotate

A simple rotation operation to rotate images by a specified angle. All images are rotated by this angle. Such a pipeline operation finds use in the case where an entire dataset is skewed and needs to be normalized.

#### Standard Parameter(s):  
1. angle_of_rotation(float): Angle by which the dataset is rotated.
Must be a positive float value. 

### Random Crop

This pipeline operation randomly crops a NxM (height x width) portion of the given dataset. This is used to randomly extract parts of the image incase we need to remove bias present in image data.

#### Standard Parameter(s):  
1. height(int): Height of resulting randomly cropped image
2. width(int): Width of resulting randomly cropped image
3. channels(int): Number of channles in resulting randomly cropped image

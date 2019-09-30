# Pipeline Operations

## Lee Filter

The presence of speckle noise in Synthetic Aperture Radar (SAR) images makes the interpretation of the contents difficult, thereby degrading the quality of the image. Therefore an efficient speckle noise removal technique, the Lee Filter is used to smoothen the static-like noise present in these images

#### Standard Parameter(s):
1. intensity(int): The internsity of the filter decided the level of smoothening that will be carried out. Ideal values lie between 2-7. A large value will result in high levels of blurring and might render the image without many features to extract. Must be a non zero positive value

#### Advanced Parameter(s): -

## Augment

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

## Rotate

A simple rotation operation to rotate images by a specified angle. All images are rotated by this angle. Such a pipeline operation finds use in the case where an entire dataset is skewed and needs to be normalized.

#### Standard Parameter(s):  
1. angle_of_rotation(float): Angle by which the dataset is rotated.
Must be a positive float value. 

## Random Crop

This pipeline operation randomly crops a NxM (height x width) portion of the given dataset. This is used to randomly extract parts of the image incase we need to remove bias present in image data.

#### Standard Parameter(s):  
1. height(int): Height of resulting randomly cropped image.
2. width(int): Width of resulting randomly cropped image.

#### Advanced Parameter(s):  

1. channels(int): Number of channles in resulting randomly cropped image.
2. seed(int): Random seed.

# Executing the Pipeline scripts


All scripts follow the following execution patter.

    python <python script name> <file or directory name> parameter1 parameter2 

for example:

    python augment.py test-images/ 10

will execute the augmentation file and will create 10 augmeented images for each image in the test-images/ directory

> Info: The current code does not have error handling functions for wrong parameter types. This will be updated soon

# Deep Learning Models

## ResNet50

#### Standard Parameter(s): 

1. `images-path`: Path to the location of the dataset. With the current version, it is recommended to use only one directory where all the data exists. The validation-training split is handled by the  `validation-split` parameter and the user does not need to handle it at the directory level

2. `output-path`: Path to the location where the user wants to save the output metrics, the model 

3. `height`: Height of the image that should be fed into the model. This height is independent of the size of the dataset. The keras `ImageDataGenerator` class handles the resizing of these images.

4. `width`: Width of the image that should be fed into the model.

#### Optional Parameter(s): These parameters have a default value and therefore the script runs using them. Please note that these are still essential to the model and the default values are put in keeping in mind the most standard practices and use cases

5. `channels`: Number of channels of the image that should be fed into the network. 1 for `grayscale`, 3 for `rbg` and 4 for `rgba` . Default = `3`.

6. `use-pretrained`: Boolen variable which decided if a pre-trained version of the ResNet50 model should be used. If set to `False`, the model trains from scratch. Default = `True`.

7. `epochs`: Number of epochs the model should train for. Default = `35`.

8. `batch-size`: Batch size that the `ImageDataGenerator` generates and feeds to the network. This affects the number of steps per epoch also. **Note**: No part of your training or validation set should be smaller than the `batch-size` as this will return 
an error.  Default = `32`.

9. validation-split (float): Fraction of the actual dataset which should be used for validation. Default = `0.25`.

10. class_mode (str): Mode of the classes that the experiment aims to solve. Possible values: "categorical", "binary", "sparse", "input", or None. Default = `categorical`.

11. learning-rate (float): Learning rate of the Adam Optimizer. Default = `0.0001`.

12. loss (str): loss function used to compile model. Default = `categorical_crossentropy`.

        
# Executing the Model scripts
    
## Resnet50

    python resnet50.py --images-path ../../PATH_TO_DATA --output-path ../../PATH_TO_OUTPUT --height 100 --width 100 --channels 3 --use_pretrained False --epochs 35 --batch-size 32 --validation-split .35 --loss binary_crossentropy --learning-rate 0.002 
    
### Outputs 

1. Model weights: model weights are saved in .h5 format which can be used for later use. They are saved as model-{timestamp}-epochs-{number of epocs}.h5
2. Figures of metrics: Two plots showing graphical distribution of accuracy vs validation accuracy and loss vs validation loss. They are saved as fig1.png and fig2.png
3. Json dumps of metrics: Two different json dumps.
    1. vaibhav_export_batch.json: Showing accuracy and loss as calculated at the end of each batch. Output frequency is too high to be used for graphical represnetation. Closest to realtime
    2. vaibhav_export_epoch.json: Showing acccuracy, loss, validation accuracy and validation loss as calculated at the end of each epoch. This is the file to be parsed for grapphical representation.

Format of vaibhav_export_epoch.json:
    
        {
            "epoch_number":
            {
                "acc": Accuracy at end of epoch,
                "val_acc": Validation Accuracy at end of epoch,
                "loss": Loss at end of epoch,
                "val_acc": Validation Loss at end of epoch,
            }
        }

Example:

        {
            "0": 
            {
                "acc": 0.48484848484848486,
                "val_acc": 0.5,
                "loss": 7.721049770911451,
                "val_loss": 8.059047736904837
            }
        }
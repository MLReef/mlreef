#TODO: Only works with Adam optimizer right now. Allows all resnet weights and all resnet models, error handling channels

import os
import argparse
import json
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import keras
from keras.preprocessing.image import ImageDataGenerator
from keras.preprocessing.image import load_img
import datetime
import time
import sys
from keras.utils import to_categorical
from keras.models import Sequential
from keras.layers import Dense, Conv2D, Flatten,Dropout,MaxPool2D
from keras.applications import ResNet50
from keras import optimizers
import math
from keras.metrics import top_k_categorical_accuracy
from keras.callbacks import ReduceLROnPlateau, CSVLogger

class Metrics(keras.callbacks.Callback):
    def on_train_begin(self, logs={}):
        self.losses = []
        self.metrics = {}
        self.metrics2 = {}
    
    
    def on_batch_end(self, batch, logs={}):
        #self.losses.append(logs.get('loss'))
        print("batch done")
        try:
            self.metrics2[batch] = {
                'acc': float(logs.get('acc')),
                #'val_acc': float(logs.get('val_acc')),
                'loss': float(logs.get('loss')),
                #'val_loss': float(logs.get('val_loss'))
            }
            with open('vaibhav_export_batch.json','w') as file:
                json.dump(self.metrics2,file)
        except Exception as identifier:
            print("Error encountered: ",identifier)

        return None


    def on_epoch_end(self, epoch, logs={}):
        #self.metrics.append([logs.get('acc'),logs.get('val_acc'),logs.get('loss'),logs.get('val_loss')])
        self.metrics[epoch] = {
            'acc': logs.get('acc'),
            'val_acc': logs.get('val_acc'),
            'loss': logs.get('loss'),
            'val_loss': logs.get('val_loss')
        }
        with open('vaibhav_export_epoch.json','w') as file:
            json.dump(self.metrics,file)
        
        return None


def dataFlow(images_path,validation_split,class_mode):
    """
    Using Keras ImageDataGenerator to create dataflows from directory provided by the user.
    """
    print("batch_size =",batch_size)
    dataGenerator = ImageDataGenerator(rescale=1./255, validation_split=validation_split)

    trainGenerator = dataGenerator.flow_from_directory(
        directory=images_path,
        target_size=(height, width),
        color_mode=color_mode(),
        batch_size=batch_size,
        class_mode=class_mode,
        shuffle=True,
        subset='training'
    )
    validationGenerator = dataGenerator.flow_from_directory(
        directory=images_path,
        target_size=(height, width),
        color_mode=color_mode(),
        batch_size=batch_size,
        class_mode=class_mode,
        shuffle=True,
        subset='validation'
    )
    return trainGenerator,validationGenerator

def ResNetModel(height,width,channels,color_mode,use_pretrained,trainGenerator,validationGenerator,loss,epochs,learning_rate):
    """
    Using the Keras implementation of the ResNet50 model with and without pretrained weights
    """
    if use_pretrained == 'True':
        url = 'https://github.com/fchollet/deep-learning-models/releases/download/v0.2/resnet50_weights_tf_dim_ordering_tf_kernels_notop.h5'
        os.system("wget -c --read-timeout=5 --tries=0 {}".format(url))
        #subprocess.run(['wget','https://github.com/fchollet/deep-learning-models/releases/download/v0.2/resnet50_weights_tf_dim_ordering_tf_kernels_notop.h5'], check=True, shell=True)
        print("Using pre-trained ResNet model \n")
        base_model = ResNet50(weights='resnet50_weights_tf_dim_ordering_tf_kernels_notop.h5',
                              include_top=False, 
                              input_shape=(height, width, channels)
                             )

    else:
        base_model = ResNet50(weights=None,
                              include_top=False, 
                              input_shape=(height, width, channels)
                              )
    model = Sequential()
    model.add(base_model)
    
    # Freeze the layers except the last 4 layers
    model.add(Dropout(0.40))
    model.add(Flatten())
    model.add(Dense(512,activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(len(trainGenerator.class_indices), activation='softmax')) #Check len feature

    learning_rate_reduction = ReduceLROnPlateau(monitor='val_acc', 
                                        patience=3, 
                                        verbose=1, 
                                        factor=0.5, 
                                        min_lr=0.00001)

    model.compile(optimizer=optimizers.adam(lr=learning_rate),loss=loss,metrics=["accuracy"])
    csv_logger = CSVLogger('training.log',append=False)
    history_callback=model.fit_generator(generator=trainGenerator,
                                        steps_per_epoch=trainGenerator.samples//trainGenerator.batch_size,
                                        verbose=1,
                                        epochs=epochs,
                                        validation_data=validationGenerator,
                                        validation_steps=validationGenerator.samples//validationGenerator.batch_size,
                                        callbacks=[learning_rate_reduction,csv_logger,Metrics()])
 
    metric_logger = Metrics()
    #print("History",history_callback.history)

    model.save_weights("model_{}-epochs-{}.h5".format(datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d-%H:%M:%S'),epochs))

    return model,metric_logger,history_callback

def saveMetrics(history_callback):
    history = history_callback.history

    plt.plot(history['acc'])
    plt.plot(history['val_acc'])
    plt.title('model accuracy')
    plt.ylabel('accuracy')
    plt.xlabel('epoch')
    plt.legend(['train', 'test'], loc='upper left')
    plt.savefig('fig1.png')
    # summarize history for loss
    plt.plot(history['loss'])
    plt.plot(history['val_loss'])
    plt.title('model loss')
    plt.ylabel('loss')
    plt.xlabel('epoch')
    plt.legend(['train', 'test'], loc='upper left')
    plt.savefig('fig2.png')

    pass


def process_arguments(args):
    parser = argparse.ArgumentParser(description='ResNet50')
    parser.add_argument('--images-path', action='store', help='path to directory of images')
    parser.add_argument('--output-path', action='store', help='path to output metrics ')
    parser.add_argument('--height', action='store', help='height of images (int)')
    parser.add_argument('--width', action='store', help='width of images (int)')
    parser.add_argument('--channels', action='store', default=3, help='channels of images: 1 = grayscale, 3 = RGB ,4=RGBA (int)')
    parser.add_argument('--use-pretrained', action='store', default=True, help='use pretrained ResNet50 weights (bool)')
    parser.add_argument('--epochs', action='store', default=35, help='number of epochs for training')
    parser.add_argument('--batch-size', action='store', default=32, help='batch size fed to the neural network (int)')
    parser.add_argument('--validation-split', action='store', default=.25, help='fraction of images to be used for validation (float)')
    parser.add_argument('--class_mode', action='store', default='categorical', help='"categorical", "binary", "sparse", "input", or None')
    parser.add_argument('--learning-rate', action='store', default=0.0001, help='learning rate of Adam Optimizer (float)')
    parser.add_argument('--loss', action='store', default='categorical_crossentropy', help='loss function used to compile model')
    params = vars(parser.parse_args(args))
    return params

if __name__ == '__main__':
    params = process_arguments(sys.argv[1:])
    images_path = params['images_path']
    output_path = params['output_path']
    height = int(params['height'])
    width = int(params['width'])
    channels = int(params['channels'])
    use_pretrained = (params['use_pretrained'])
    epochs = int(params['epochs'])
    batch_size = int(params['batch_size'])
    validation_split = float(params['validation_split'])
    class_mode = params['class_mode']
    learning_rate = float(params['learning_rate'])
    loss = params['loss']
    color_mode = lambda  : 'rbga' if channels == 4 else ('grayscale' if channels == 1 else 'rgb') #handle this potential error

    trainGenerator,validationGenerator = dataFlow(images_path,validation_split,class_mode)
    print(trainGenerator.class_indices)
    print("\n")
    print(len(validationGenerator.class_indices))
    print("\n")
    model,_,history = ResNetModel(height,width,channels,color_mode,use_pretrained,trainGenerator,validationGenerator,loss,epochs,learning_rate)
    saveMetrics(history)
    
    pass
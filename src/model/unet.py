# TODO: Implement checkpoints

import os
import argparse
import sys
import json
import datetime
import time
import keras
import skimage.io as io
import skimage.transform as trans
from keras.models import *
from keras.layers import *
from keras.optimizers import *
from keras.preprocessing.image import ImageDataGenerator
import glob


class Metrics(keras.callbacks.Callback):

    def on_train_begin(self, logs={}):
        self.metrics = {}
        self.metrics2 = {}

    def on_batch_end(self, batch, logs={}):
        try:
            self.metrics2[batch] = {
                'acc': float(logs.get('acc')),
                'loss': float(logs.get('loss')),
            }
            with open('{}/experiment_batch_unet.json'.format(output_path), 'w') as file:
                json.dump(self.metrics2, file)
        except Exception as identifier:
            print("Error encountered: ", identifier)

        return None

    def on_epoch_end(self, epoch, logs={}):
        self.metrics[epoch] = {
            'acc': logs.get('acc'),
            'val_acc': logs.get('val_acc'),
            'loss': logs.get('loss'),
            'val_loss': logs.get('val_loss')
        }
        with open('{}/experiment_unet.json'.format(output_path), 'w') as file:
            json.dump(self.metrics, file)
        return None


def unet(height, width, loss, pretrained_weights=None):
    input_size = (height, width, 1)
    inputs = Input(input_size)
    conv1 = Conv2D(64, 3, activation='relu', padding='same', kernel_initializer='he_normal')(inputs)
    conv1 = Conv2D(64, 3, activation='relu', padding='same', kernel_initializer='he_normal')(conv1)
    pool1 = MaxPooling2D(pool_size=(2, 2))(conv1)
    conv2 = Conv2D(128, 3, activation='relu', padding='same', kernel_initializer='he_normal')(pool1)
    conv2 = Conv2D(128, 3, activation='relu', padding='same', kernel_initializer='he_normal')(conv2)
    pool2 = MaxPooling2D(pool_size=(2, 2))(conv2)
    conv3 = Conv2D(256, 3, activation='relu', padding='same', kernel_initializer='he_normal')(pool2)
    conv3 = Conv2D(256, 3, activation='relu', padding='same', kernel_initializer='he_normal')(conv3)
    pool3 = MaxPooling2D(pool_size=(2, 2))(conv3)
    conv4 = Conv2D(512, 3, activation='relu', padding='same', kernel_initializer='he_normal')(pool3)
    conv4 = Conv2D(512, 3, activation='relu', padding='same', kernel_initializer='he_normal')(conv4)
    drop4 = Dropout(0.5)(conv4)
    pool4 = MaxPooling2D(pool_size=(2, 2))(drop4)

    conv5 = Conv2D(1024, 3, activation='relu', padding='same', kernel_initializer='he_normal')(pool4)
    conv5 = Conv2D(1024, 3, activation='relu', padding='same', kernel_initializer='he_normal')(conv5)
    drop5 = Dropout(0.5)(conv5)

    up6 = Conv2D(512, 2, activation='relu', padding='same', kernel_initializer='he_normal')(UpSampling2D(size=(2, 2))
                                                                                            (drop5))
    merge6 = concatenate([drop4, up6], axis=3)
    conv6 = Conv2D(512, 3, activation='relu', padding='same', kernel_initializer='he_normal')(merge6)
    conv6 = Conv2D(512, 3, activation='relu', padding='same', kernel_initializer='he_normal')(conv6)

    up7 = Conv2D(256, 2, activation='relu', padding='same', kernel_initializer='he_normal')(UpSampling2D
                                                                                            (size=(2, 2))(conv6))
    merge7 = concatenate([conv3, up7], axis=3)
    conv7 = Conv2D(256, 3, activation='relu', padding='same', kernel_initializer='he_normal')(merge7)
    conv7 = Conv2D(256, 3, activation='relu', padding='same', kernel_initializer='he_normal')(conv7)

    up8 = Conv2D(128, 2, activation='relu', padding='same', kernel_initializer='he_normal')(UpSampling2D(size=(2, 2))
                                                                                            (conv7))
    merge8 = concatenate([conv2, up8], axis=3)
    conv8 = Conv2D(128, 3, activation='relu', padding='same', kernel_initializer='he_normal')(merge8)
    conv8 = Conv2D(128, 3, activation='relu', padding='same', kernel_initializer='he_normal')(conv8)

    up9 = Conv2D(64, 2, activation='relu', padding='same', kernel_initializer='he_normal')(
        UpSampling2D(size=(2, 2))(conv8))
    merge9 = concatenate([conv1, up9], axis=3)
    conv9 = Conv2D(64, 3, activation='relu', padding='same', kernel_initializer='he_normal')(merge9)
    conv9 = Conv2D(64, 3, activation='relu', padding='same', kernel_initializer='he_normal')(conv9)
    conv9 = Conv2D(2, 3, activation='relu', padding='same', kernel_initializer='he_normal')(conv9)
    conv10 = Conv2D(1, 1, activation='sigmoid')(conv9)

    model: Model = Model(input=inputs, output=conv10)

    model.compile(optimizer=Adam(lr=1e-4), loss=loss, metrics=['accuracy'])
    model.summary()

    if pretrained_weights:
        model.load_weights(pretrained_weights)

    return model


def adjust_data(img, mask, flag_multi_class, num_class):
    if flag_multi_class:
        img = img / 255
        mask = mask[:, :, :, 0] if (len(mask.shape) == 4) else mask[:, :, 0]
        new_mask = np.zeros(mask.shape + (num_class,))
        for i in range(num_class):
            new_mask[mask == i, i] = 1
        new_mask = np.reshape(new_mask, (new_mask.shape[0], new_mask.shape[1] * new_mask.shape[2], new_mask.shape[3])) \
            if flag_multi_class else np.reshape(new_mask, (new_mask.shape[0] * new_mask.shape[1], new_mask.shape[2]))
        mask = new_mask
    elif np.max(img) > 1:
        img = img / 255
        mask = mask / 255
        mask[mask > 0.5] = 1
        mask[mask <= 0.5] = 0
    return img, mask


def train_generator(batch_size, train_path, image_folder, mask_folder, height, width, aug_dict,
                    image_color_mode="grayscale",
                    mask_color_mode="grayscale", image_save_prefix="image", mask_save_prefix="mask",
                    flag_multi_class=False, num_class=2, save_to_dir=None, seed=1):
    print("Executing 2")
    print(batch_size)
    target_size = (height, width)
    print(target_size)
    image_datagen = ImageDataGenerator(**aug_dict)
    mask_datagen = ImageDataGenerator(**aug_dict)
    image_generator = image_datagen.flow_from_directory(
        train_path,
        classes=[image_folder],
        class_mode=None,
        color_mode=image_color_mode,
        target_size=target_size,
        batch_size=batch_size,
        save_to_dir=save_to_dir,
        save_prefix=image_save_prefix,
        seed=seed)
    mask_generator = mask_datagen.flow_from_directory(
        train_path,
        classes=[mask_folder],
        class_mode=None,
        color_mode=mask_color_mode,
        target_size=target_size,
        batch_size=batch_size,
        save_to_dir=save_to_dir,
        save_prefix=mask_save_prefix,
        seed=seed)
    train_generator = zip(image_generator, mask_generator)
    for (img, mask) in train_generator:
        img, mask = adjust_data(img, mask, flag_multi_class, num_class)
        yield (img, mask)


def test_generator(test_path, num_image=30, target_size=(256, 256), flag_multi_class=False, as_gray=True):
    for i in range(num_image):
        img = io.imread(os.path.join(test_path, "%d.png" % i), as_gray=as_gray)
        img = img / 255
        img = trans.resize(img, target_size)
        img = np.reshape(img, img.shape + (1,)) if (not flag_multi_class) else img
        img = np.reshape(img, (1,) + img.shape)
        yield img


def gen_train_npy(image_path, mask_path, flag_multi_class=False, num_class=2, image_prefix="image", mask_prefix="mask",
                  image_as_gray=True, mask_as_gray=True):
    image_name_arr = glob.glob(os.path.join(image_path, "%s*.png" % image_prefix))
    image_arr = []
    mask_arr = []
    for index, item in enumerate(image_name_arr):
        img = io.imread(item, as_gray=image_as_gray)
        img = np.reshape(img, img.shape + (1,)) if image_as_gray else img
        mask = io.imread(item.replace(image_path, mask_path).replace(image_prefix, mask_prefix), as_gray=mask_as_gray)
        mask = np.reshape(mask, mask.shape + (1,)) if mask_as_gray else mask
        img, mask = adjust_data(img, mask, flag_multi_class, num_class)
        image_arr.append(img)
        mask_arr.append(mask)
    image_arr = np.array(image_arr)
    mask_arr = np.array(mask_arr)
    return image_arr, mask_arr


data_gen_args = dict(rotation_range=0.0, width_shift_range=0.00, height_shift_range=0.00, shear_range=0.00,
                     zoom_range=0.00, horizontal_flip=False, fill_mode='nearest')


def process_arguments(args):
    parser = argparse.ArgumentParser(description='UNet model for semantic segmentation')
    parser.add_argument('--images-path', action='store', help='path to directory of images')
    parser.add_argument('--images-name', action='store', help='name of the folder of images')
    parser.add_argument('--mask-name', action='store', help='namme of the folder of corresponding masks')
    parser.add_argument('--output-path', action='store', default='.', help='path to output metrics')
    parser.add_argument('--height', action='store', default=256, help='height of images (int)')
    parser.add_argument('--width', action='store', default=256, help='width of images (int)')
    parser.add_argument('--channels', action='store', default=3, help='channels of images: 1 = grayscale, 3 = RGB ,'
                                                                      '4=RGBA (int)')
    parser.add_argument('--use-pretrained', action='store', default=False, help='use pretrained ResNet50 weights (bool)'
                        )
    parser.add_argument('--weights-path', action='store', help='path to pretrained weights')
    parser.add_argument('--epochs', action='store', help='number of epochs for training')
    parser.add_argument('--steps-per-epoch', action='store', default=2500,
                        help='number of steps per epochs for training'
                        )
    parser.add_argument('--batch-size', action='store', default=4, help='batch size fed to the neural network (int)')
    parser.add_argument('--class_mode', action='store', default='categorical', help='"categorical", "binary", "sparse",'
                                                                                    ' "input", or None')
    parser.add_argument('--learning-rate', action='store', default=0.0001, help='learning rate of Adam Optimizer'
                                                                                ' (float)')
    parser.add_argument('--loss', action='store', default='binary_crossentropy', help='loss function used to '
                                                                                      'compile model')
    params = vars(parser.parse_args(args))
    return params


if __name__ == "__main__":
    params = process_arguments(sys.argv[1:])
    images_path = params['images_path']
    images_name = params['images_name']
    mask_name = params['mask_name']
    output_path = params['output_path']
    height = int(params['height'])
    width = int(params['width'])
    channels = int(params['channels'])
    use_pretrained = (params['use_pretrained'])
    epochs = int(params['epochs'])
    steps_per_epoch = int(params['steps_per_epoch'])
    batch_size = int(params['batch_size'])
    class_mode = params['class_mode']
    learning_rate = float(params['learning_rate'])
    loss = params['loss']
    color_mode = lambda: 'rbga' if channels == 4 else (
        'grayscale' if channels == 1 else 'rgb')  # handle this potential error

    print("Executing")
    generator = train_generator(batch_size, images_path, images_name, mask_name, height, width, data_gen_args,
                                save_to_dir=None)
    model = unet(height, width, loss)
    metric_logger = Metrics()
    keras_history = model.fit_generator(generator, steps_per_epoch=steps_per_epoch, epochs=epochs,
                                        callbacks=[metric_logger])
    model.save_weights("{}/model_unet_{}_epochs_{}.h5".format(output_path, datetime.datetime.fromtimestamp(time.time()).
                                                              strftime('%Y-%m-%d-%H:%M:%S'), epochs))
pass

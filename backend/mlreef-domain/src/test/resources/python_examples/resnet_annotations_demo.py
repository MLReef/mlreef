import annotations.metric_annotations as metric_result
import annotations.parameter_annotations as params
import datetime
import os
import shutil
import time
from annotations.metric_annotations import metric
from annotations.parameter_annotations import parameter
from keras import optimizers
from keras.applications import ResNet50
from keras.callbacks import ReduceLROnPlateau, CSVLogger
from keras.layers import Dense, Flatten, Dropout
from keras.models import Sequential
from keras.preprocessing.image import ImageDataGenerator


def data_flow(images_path, training_split, validation_split, class_mode):
    """
    Using Keras ImageDataGenerator to create dataflows from directory provided by the user.
    """

    data_generator = ImageDataGenerator(rescale=1. / 255, validation_split=validation_split)

    train_generator = data_generator.flow_from_directory(
        directory=images_path,
        target_size=(height, width),
        color_mode=color_mode(),
        batch_size=batch_size,
        class_mode=class_mode,
        shuffle=True,
        subset='training'
    )
    DIR = images_path
    num_images = len([name for name in os.listdir(DIR) if os.path.isfile(os.path.join(DIR, name))])
    os.makedirs(DIR + 'test_temp_dir/')
    images = os.listdir(DIR)
    num_file_to_move = num_images - num_images * training_split

    for index, file in enumerate(images):
        if index == num_file_to_move:
            break
        shutil.copy(DIR + file, DIR + 'test/')

    # TODO: Delete the extra files and folder after training

    validation_generator = data_generator.flow_from_directory(
        directory=images_path,
        target_size=(height, width),
        color_mode=color_mode(),
        batch_size=batch_size,
        class_mode=class_mode,
        shuffle=True,
        subset='validation'
    )

    testing_generator = data_generator.flow_from_directory(
        directory=DIR + 'test_temp_dir/',
        target_size=(height, width),
        color_mode=color_mode(),
        batch_size=batch_size,
        class_mode=class_mode,
        shuffle=True,
        subset='testing'
    )
    return train_generator, testing_generator, validation_generator


def resnet_model(height, width, channels, color_mode, use_pretrained, trainGenerator, validationGenerator, loss, epochs,
                 learning_rate):
    """
    Using the Keras implementation of the ResNet50 model with and without pretrained weights
    """
    if use_pretrained == 'True':
        url = 'https://github.com/fchollet/deep-learning-models/releases/download/v0.2/resnet50_weights_tf_dim_ordering' \
              '_tf_kernels_notop.h5'
        os.system("wget -c --read-timeout=5 --tries=0 {}".format(url))
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
    model.add(Dense(512, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(len(trainGenerator.class_indices), activation='softmax'))  # Check len feature

    learning_rate_reduction = ReduceLROnPlateau(monitor='val_acc',
                                                patience=3,
                                                verbose=1,
                                                factor=0.5,
                                                min_lr=0.00001)

    model.compile(optimizer=optimizers.adam(lr=learning_rate), loss=loss, metrics=["accuracy"])
    csv_logger = CSVLogger('training.log', append=False)
    history_callback = model.fit_generator(generator=trainGenerator,
                                           steps_per_epoch=trainGenerator.samples // trainGenerator.batch_size,
                                           verbose=1,
                                           epochs=epochs,
                                           validation_data=validationGenerator,
                                           validation_steps=validationGenerator.samples // validationGenerator.batch_size,
                                           callbacks=[learning_rate_reduction, csv_logger, Metrics()])

    model.save_weights("{}/model_Resnet50_{}_epochs_{}.h5".format(output_path, datetime.datetime.fromtimestamp(
        time.time()).strftime('%Y-%m-%d-%H:%M:%S'), epochs))

    return model, history_callback


# TODO FIXME: @V: Add dataOperation annotation please. Dont ignore my comments.
@data_processor(
    name="Resnet 2.0 Filter",
    author="MLReef",
    type="ALGORITHM",
    description="Transforms images with lots of magic",
    visibility="PUBLIC",
    input_type="IMAGE",
    output_type="IMAGE"
)
# TODO FIXME: I've used the default python datatypes str and int instead of enum for making the file run
@parameter('images_path', "str", True, '.')
@parameter('output_path', "str", True, '.')
@parameter('height', "int", True, 256)
@parameter('width', "int", True, 256)
@parameter('epochs', "int", True, 5)
@parameter('channels', "int", False, 3)
@parameter('use_pretrained', "str", False, 'False')
@parameter('class_mode', "str", False, 'binary')
@parameter('batch_size', "int", False, 32)
@parameter('training_split', 'float', False, .8)
@parameter('validation_split', 'float', False, .2)
@parameter('learning_rate', 'float', False, .0001)
@parameter('loss', 'float', False, 0.1)
def init_parameters():
    pass


if __name__ == '__main__':
    init_parameters()
    # To avoid this, all variables that are injected should be used as params.variable_name in the rest of the file
    images_path = params.images_path
    output_path = params.output_path
    height = params.height
    width = params.width
    epochs = params.epochs
    channels = params.channels
    use_pretrained = params.use_pretrained
    batch_size = params.batch_size
    training_split = params.training_split
    validation_split = params.validation_split
    learning_rate = params.learning_rate
    class_mode = params.class_mode
    loss = params.loss
    color_mode = lambda: 'rbga' if channels == 4 else (
        'grayscale' if channels == 1 else 'rgb')  # handle this potential error

    trainGenerator, testGenerator, validationGenerator = data_flow(images_path, training_split, validation_split,
                                                                   class_mode)
    model, history = resnet_model(height, width, channels, color_mode, use_pretrained, trainGenerator,
                                  validationGenerator, loss, epochs, learning_rate)

    test_pred = model.predict(testGenerator)
    test_truth = testGenerator.classes


    @metric(name='recall', ground_truth=test_truth, prediction=test_pred)
    def call_metric():
        pass


    call_metric()
    recall = metric_result.result
    pass

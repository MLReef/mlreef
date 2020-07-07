from vergeml.utils import VergeMLError, did_you_mean
from vergeml.io import SourcePlugin, source
from vergeml.option import option
from vergeml.sources.image import ImageSource
from vergeml.sources.labeled_image import LabeledImageSource
from vergeml.img import INPUT_PATTERNS, resize_image
import os.path
import numpy as np

# TODO rename image-features

class ImageNetFeatures:

    def __init__(self, args: dict={}):

        self.model = None
        self.preprocess_input = None

        self.variant = args.get('variant')
        self.alpha = args.get('alpha')
        self.size = args.get('size')
        self.output_layer = args.get('output-layer')
        self.architecture = args.get('architecture')
        trainings_dir = args.get('trainings-dir')
        evaluate_args(self.architecture, trainings_dir, self.variant, self.alpha, self.size)
        self.image_size = get_image_size(self.architecture, self.variant, self.size)

@source('image-features', descr='Load Images and convert to feature vectors.', input_patterns=INPUT_PATTERNS)
@option('output-layer', default='last', descr='Index or name of the output layer to use.', type="Union[str,int]")
@option('architecture', default='resnet-50', descr='Name of the CNN to use. Use @name for your own.', type="Union[str,int]")
@option('variant', default='auto', descr='The variant of the CNN.', type=str)
@option('size', default="auto", descr='The input size of the CNN.', type='Union[str, int]')
@option('alpha', default=1.0, descr='MobileNet alpha value.', type=float)
class ImageFeaturesSource(ImageSource, ImageNetFeatures):

    def __init__(self, args: dict={}):
        super().__init__(args)
        ImageNetFeatures.__init__(self, args)

    def transform(self, sample):
        if not self.model:
            if not self.architecture.startswith("@"):
                _, self.preprocess_input, self.model = \
                    get_imagenet_architecture(self.architecture, self.variant, self.size, self.alpha, self.output_layer)
            else:
                self.model = get_custom_architecture(self.architecture, self.trainings_dir, self.output_layer)
                self.preprocess_input = generic_preprocess_input

        x = sample.x
        x = x.convert('RGB')
        x = resize_image(x, self.image_size, self.image_size, 'antialias', 'aspect-fill')
        #x = x.resize((self.image_size, self.image_size))
        x = np.asarray(x)
        x = np.expand_dims(x, axis=0)
        x = self.preprocess_input(x)
        features = self.model.predict(x)
        features = features.flatten()
        sample.x = features
        sample.y = None
        return sample

@source('labeled-image-features', descr='Load labeled Images and convert to feature vectors.', input_patterns=INPUT_PATTERNS)
@option('output-layer', default='last', descr='Index or name of the output layer to use.', type="Union[str,int]")
@option('architecture', default='resnet-50', descr='Name of the CNN to use. Use @name for your own.', type="Union[str,int]")
@option('variant', default='auto', descr='The variant of the CNN.', type=str)
@option('size', default="auto", descr='The size of the CNN.', type='Union[str, int]')
@option('alpha', default=1.0, descr='MobileNet alpha value.', type=float)
class LabeledImageFeaturesSource(LabeledImageSource, ImageNetFeatures):

    def __init__(self, args: dict={}):
        super().__init__(args)
        ImageNetFeatures.__init__(self, args)

    def transform(self, sample):
        if not self.model:
            if not self.architecture.startswith("@"):
                self.preprocess_input = get_preprocess_input(self.architecture)
                self.model = get_imagenet_architecture(self.architecture, self.variant, self.image_size, self.alpha, self.output_layer)
            else:
                # TODO get image size!
                self.model = get_custom_architecture(self.architecture, self.trainings_dir, self.output_layer)
                self.preprocess_input = generic_preprocess_input

        x = sample.x
        # TODO better resize
        x = x.convert('RGB')
        x = resize_image(x, self.image_size, self.image_size, 'antialias', 'aspect-fill')
        # x = x.resize((self.image_size, self.image_size))
        x = np.asarray(x)
        x = np.expand_dims(x, axis=0)
        x = self.preprocess_input(x)
        features = self.model.predict(x)
        features = features.flatten()
        sample.x = features
        sample = super().transform(sample)
        return sample



ARCHITECTURES = (
    'densenet',
    'inception-v3',
    'inception-resnet-v3',
    'mobilenet',
    'mobilenet-v2',
    'nasnet',
    'resnet-50',
    'vgg16',
    'vgg19',
    'xception'
)

DENSENET_VARIANTS = (
    'densenet-121',
    'densenet-169',
    'densenet-201'
)

MOBILENET_SIZES = (
    128,
    160,
    192,
    224
)

MOBILENET_ALPHA_VALUES = (
    0.25,
    0.50,
    0.75,
    1.0
)

MOBILENET_V2_SIZES = (
    96,
    128,
    160,
    192,
    224
)

MOBILENET_V2_ALPHA_VALUES = (
    0.35,
    0.50,
    0.75,
    1.0,
    1.3,
    1.4
)

NASNET_VARIANTS = (
    'large',
    'mobile'
)

def get_custom_architecture(name, trainings_dir, output_layer):
    from keras.models import load_model, Model
    name = name.lstrip("@")
    model = load_model(os.path.join(trainings_dir, name, 'checkpoints', 'model.h5'))
    try:
        if isinstance(output_layer, int):
            layer = model.layers[output_layer]
        else:
            layer = model.get_layer(output_layer)
    except Exception:
        if isinstance(output_layer, int):
            raise VergeMLError(f'output-layer {output_layer} not found - model has only {len(model.layers)} layers.')
        else:
            candidates = list(map(lambda l: l.name, model.layers))
            raise VergeMLError(f'output-layer named {output_layer} not found.',
                               suggestion=did_you_mean(candidates, output_layer))
    model = Model(inputs=model.input, outputs=layer.output)
    return model


def get_imagenet_architecture(architecture, variant, size, alpha, output_layer, include_top=False, weights='imagenet'):
    from keras import applications, Model

    if include_top:
        assert output_layer == 'last'

    if size == 'auto':
        size = get_image_size(architecture, variant, size)

    shape = (size, size, 3)

    if architecture == 'densenet':
        if variant == 'auto':
            variant = 'densenet-121'
        if variant == 'densenet-121':
            model = applications.DenseNet121(weights=weights, include_top=include_top, input_shape=shape)
        elif variant == 'densenet-169':
            model = applications.DenseNet169(weights=weights, include_top=include_top, input_shape=shape)
        elif variant == 'densenet-201':
            model = applications.DenseNet201(weights=weights, include_top=include_top, input_shape=shape)
    elif architecture == 'inception-resnet-v2':
        model = applications.InceptionResNetV2(weights=weights, include_top=include_top, input_shape=shape)
    elif architecture == 'mobilenet':
        model = applications.MobileNet(weights=weights, include_top=include_top, input_shape=shape, alpha=alpha)
    elif architecture == 'mobilenet-v2':
        model = applications.MobileNetV2(weights=weights, include_top=include_top, input_shape=shape, alpha=alpha)
    elif architecture == 'nasnet':
        if variant == 'auto':
            variant = 'large'
        if variant == 'large':
            model = applications.NASNetLarge(weights=weights, include_top=include_top, input_shape=shape)
        else:
            model = applications.NASNetMobile(weights=weights, include_top=include_top, input_shape=shape)
    elif architecture == 'resnet-50':
        model = applications.ResNet50(weights=weights, include_top=include_top, input_shape=shape)
    elif architecture == 'vgg-16':
        model = applications.VGG16(weights=weights, include_top=include_top, input_shape=shape)
    elif architecture == 'vgg-19':
        model = applications.VGG19(weights=weights, include_top=include_top, input_shape=shape)
    elif architecture == 'xception':
        model = applications.Xception(weights=weights, include_top=include_top, input_shape=shape)
    elif architecture == 'inception-v3':
        model = applications.InceptionV3(weights=weights, include_top=include_top, input_shape=shape)

    if output_layer != 'last':
        try:
            if isinstance(output_layer, int):
                layer = model.layers[output_layer]
            else:
                layer = model.get_layer(output_layer)
        except Exception:
            raise VergeMLError('layer not found: {}'.format(output_layer))
        model = Model(inputs=model.input, outputs=layer.output)

    return model

def generic_preprocess_input(input):
    """work around ValueError: output array is read-only when using:
        return mobilenetv2.preprocess_input(input)"""
    input = input / 128
    input = input - 1.
    return input.astype(np.float32)

def get_preprocess_input(architecture):
    from keras import applications
    preprocess_input = {
        'densenet': applications.densenet.preprocess_input,
        'inception-resnet-v2': applications.inception_resnet_v2.preprocess_input,
        'inception-v3': applications.inception_v3.preprocess_input,
        'mobilenet': applications.mobilenet.preprocess_input,
        'mobilenet-v2': generic_preprocess_input,
        'nasnet': applications.nasnet.preprocess_input,
        'resnet-50': applications.resnet50.preprocess_input,
        'vgg-16': applications.vgg16.preprocess_input,
        'vgg-19': applications.vgg19.preprocess_input,
        'xception': applications.xception.preprocess_input
    }
    return preprocess_input[architecture]

def get_decode_predictions(architecture):
    from keras import applications
    decode_predictions = {
        'densenet': applications.densenet.decode_predictions,
        'inception-resnet-v2': applications.inception_resnet_v2.decode_predictions,
        'inception-v3': applications.inception_v3.decode_predictions,
        'mobilenet': applications.mobilenet.decode_predictions,
        'mobilenet-v2': applications.mobilenetv2.decode_predictions,
        'nasnet': applications.nasnet.decode_predictions,
        'resnet-50': applications.resnet50.decode_predictions,
        'vgg-16': applications.vgg16.decode_predictions,
        'vgg-19': applications.vgg19.decode_predictions,
        'xception': applications.xception.decode_predictions
    }
    return decode_predictions[architecture]

def get_image_size(architecture, variant=None, size=None):
    # TODO make this work for @custom-AI
    if architecture == 'densenet':
        image_size = 224
    elif architecture == 'inception-v3':
        image_size = 299
    elif architecture == 'inception-resnet-v2':
        image_size = 299
    elif architecture == 'mobilenet' or architecture == 'mobilenet-v2':
        if size == "auto":
            image_size = 224
        else:
            image_size = size
    elif architecture == 'nasnet':
        if variant == 'large':
            image_size = 331
        else:
            image_size = 224
    elif architecture == 'resnet-50':
        image_size = 224
    elif architecture == 'vgg-16':
        image_size = 224
    elif architecture == 'vgg-19':
        image_size = 224
    elif architecture == 'xception':
        image_size = 299
    return image_size

def evaluate_args(architecture, trainings_dir, variant, alpha, size):

    if not architecture.startswith('@') and not architecture in ARCHITECTURES:
        raise VergeMLError("Unknown CNN: {}".format(architecture))
    elif architecture.startswith('@'):
        name = architecture.lstrip('@')
        path = os.path.join(trainings_dir, name, 'checkpoints', 'model.h5')
        if not os.path.isfile(path):
            raise VergeMLError("Unknown CNN: {}".format(architecture))

    if architecture == 'densenet':
        if variant == 'auto':
            variant = DENSENET_VARIANTS[0]
        if not variant in DENSENET_VARIANTS:
            raise VergeMLError("Invalid densenet variant: {}".format(variant))

    elif architecture == 'mobilenet':
        if size not in MOBILENET_SIZES and size != "auto":
            raise VergeMLError("Invalid mobilenet size: {}".format(size))
        if alpha not in MOBILENET_ALPHA_VALUES:
            raise VergeMLError("Invalid alpha value: {}".format(alpha))

    elif architecture == 'mobilenet-v2':
        if size not in MOBILENET_V2_SIZES and size != "auto":
            raise VergeMLError("Invalid mobilenet size: {}".format(size))

        if alpha not in MOBILENET_V2_ALPHA_VALUES:
            raise VergeMLError("Invalid alpha value: {}".format(alpha))

    elif architecture == 'nasnet':
        if not variant in NASNET_VARIANTS and variant != 'auto':
            raise VergeMLError("Invalid nasnet variant: {}".format(variant))
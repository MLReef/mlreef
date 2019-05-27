# pylint: disable=C0111
from setuptools import setup, find_packages

with open("README.md", "r") as fh:
    LONG_DESCRIPTION = fh.read()


setup(
    name="vergeml",
    version="0.1.4",
    author="Markus Ecker",
    author_email="markus.ecker@gmail.com",
    description="Machine Learning Environment",
    license="MIT",
    keywords="ai deep learning",
    url="http://github.com/vergeml/vergeml",
    packages=find_packages(),
    long_description=LONG_DESCRIPTION,
    long_description_content_type="text/markdown",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Topic :: Utilities",
        "License :: OSI Approved :: MIT License",
    ],
    include_package_data=True,
    install_requires=[
        'numpy',
        'pyyaml',
        'lz4',
        'scikit-learn',
        # install this for the first release only - in a subsequent release dependencies should be
        # installed on demand
        'Pillow',
        'keras',
        'waitress',
        'matplotlib'
    ],
    # preprocess=vergeml.commands.preprocess:preprocess
    # mnist=vergeml.datasets.mnist:download
    # fashion-mnist=vergeml.datasets.fashion_mnist:download
    # cifar-10=vergeml.datasets.cifar_10:download
    # cifar-100=vergeml.datasets.cifar_100:download
    # celeba=vergeml.datasets.celeba:download
    # svhn=vergeml.datasets.svhn:download

    # dogs=vergeml.datasets.dogs:download
    # unique-objects=vergeml.datasets.unique_objects:download
    entry_points="""
    [vergeml.cmd]
    help=vergeml.commands.help:HelpCommand
    new=vergeml.commands.new:NewCommand
    list=vergeml.commands.ls:ListCommand
    download=vergeml.commands.download:DownloadCommand
    run=vergeml.commands.run:RunCommand
    plot=vergeml.commands.plot:PlotCommand
    preprocess=vergeml.commands.preprocess:PreprocessCommand

    [vergeml.download]
    cats-and-dogs=vergeml.datasets.cats_and_dogs:CatsAndDogsDataset
    ham10000=vergeml.datasets.ham10000:Ham10KDataset
    unique-objects=vergeml.datasets.unique_objects:UniqueObjectsDataset
    dogs=vergeml.datasets.dogs:DogsDataset

    [vergeml.run]
    tensorboard=vergeml.services.tensorboard:TensorboardService
    rest=vergeml.services.rest:RestService

    [vergeml.plot]
    roc=vergeml.plots.roc:ROCPlot
    confusion-matrix=vergeml.plots.confusion_matrix:ConfusionMatrixPlot
    pr=vergeml.plots.pr:PRPlot

    [vergeml.operation]
    augment=vergeml.operations.augment:AugmentOperation
    resize=vergeml.operations.resize:ResizeOperation[Pillow]
    grayscale=vergeml.operations.grayscale:GrayscaleOperation[Pillow]
    rgb=vergeml.operations.rgb:RGBOperation[Pillow]
    crop=vergeml.operations.crop:CropOperation[Pillow]
    random-crop=vergeml.operations.random_crop:RandomCropOperation[Pillow]
    flip-horizontal=vergeml.operations.flip_horizontal:FlipHorizontalOperation[Pillow]
    flip-vertical=vergeml.operations.flip_vertical:FlipVerticalOperation[Pillow]

    [vergeml.io]
    image=vergeml.sources.image:ImageSource[Pillow]
    labeled-image=vergeml.sources.labeled_image:LabeledImageSource[Pillow]
    labeled-image-features=vergeml.sources.features:LabeledImageFeaturesSource[Pillow]
    image-features=vergeml.sources.features:ImageFeaturesSource[Pillow]
    mnist=vergeml.sources.mnist:plugin[Pillow]

    [vergeml.model]
    imagenet=vergeml.models.imagenet:ImageNetModelPlugin

    [console_scripts]
    ml = vergeml.__main__:main
    """
)

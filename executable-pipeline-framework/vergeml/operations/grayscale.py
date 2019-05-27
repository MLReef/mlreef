from vergeml.img import ImageType
from vergeml.operation import OperationPlugin, operation
from vergeml.option import option
from PIL import Image

@operation('grayscale', topic="image", descr="Convert an image to grayscale mode.", long_descr="")
class GrayscaleOperation(OperationPlugin):
    type = ImageType

    def transform(self, img, rng):
        return img.convert('gray')
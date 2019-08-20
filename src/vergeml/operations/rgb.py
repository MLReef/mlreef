from vergeml.img import ImageType
from vergeml.operation import OperationPlugin, operation
from vergeml.option import option
from PIL import Image

@operation('rgb', topic="image", descr="Convert an image to RGB mode.")
class RGBOperation(OperationPlugin):
    type = ImageType

    def transform(self, img, rng):
        return img.convert('RGB')
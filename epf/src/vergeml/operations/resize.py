from vergeml.img import ImageType, RESIZE_METHODS, RESIZE_MODES, resize_image
from vergeml.operation import OperationPlugin, operation
from vergeml.option import option
from PIL import Image

@operation('resize', topic="image", descr="Resize an image to a fixed size.")
@option('width', type=int, descr="Width of the new size.", validate='>0')
@option('height', type=int, descr="Height of the new size.", validate='>0')
@option('channels', type=int, descr="Number of channels.", validate=(0, 3))
@option('method', type=str, descr="Scaling Method.", default="antialias", validate=RESIZE_METHODS)
@option('mode', type=str, descr="Scaling Mode.", default="fill", validate=RESIZE_MODES)
class ResizeOperation(OperationPlugin):
    type = ImageType
    

    def __init__(self, width, height, channels=None, method='antialias', mode='fill', apply=None):
        assert method in RESIZE_METHODS
        assert mode in RESIZE_MODES
        assert channels in (None, 1, 3)

        super().__init__(apply)

        self.width = width
        self.height = height
        self.channels = channels
        self.method = method
        self.mode = mode

    def transform(self, img, rng):
        
        rimg = resize_image(img, self.width, self.height, self.method, self.mode)
        
        if self.channels is None:
            if rimg.format != img.format:
                rimg = rimg.convert(img.format)
            return rimg
        elif self.channels == 1:
            return rimg.convert('gray')
        elif self.channels == 3:
            return rimg.convert('RGB')
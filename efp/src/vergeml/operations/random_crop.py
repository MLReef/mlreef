from vergeml.img import ImageType
from vergeml.operation import OperationPlugin, operation
from vergeml.option import option
from PIL import Image
from vergeml.utils import VergeMLError

@operation('random-crop', topic="image", descr="Crop random regions of an image.")
@option('width', type=int, descr="Width of the rectangle.", validate='>0')
@option('height', type=int, descr="Height of the rectangle.", validate='>0')
class RandomCropOperation(OperationPlugin):
    type = ImageType

    def __init__(self, width:int, height:int, apply=None):
        super().__init__(apply)
        self.width = width
        self.height = height

    def transform_xy(self, x, y, rng):
        imgs = [img for img in (x,y) if isinstance(img, ImageType)]

        if not len(imgs):
            raise VergeMLError("random_crop needs samples of type image")

        maxwidth = min([img.size[0] for img in imgs])
        maxheight = min([img.size[1] for img in imgs])

        if maxwidth < self.width:
            raise VergeMLError("Can't crop sample with width {} to {}.".format(maxwidth, self.width))
        
        if maxheight < self.height:
            raise VergeMLError("Can't crop sample with height {} to {}.".format(maxheight, self.height))

        maxx = maxwidth - self.width
        maxy = maxheight - self.height

        xco = rng.randint(0, maxx)
        yco = rng.randint(0, maxy)
        params = xco, yco, xco + self.width, yco + self.height

        if isinstance(x, ImageType):
            x = x.crop(params)
        
        if isinstance(y, ImageType):
            y = y.crop(params)

        return x, y
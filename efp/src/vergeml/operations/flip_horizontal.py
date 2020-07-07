from vergeml.img import ImageType
from vergeml.operation import OperationPlugin, operation
from vergeml.option import option
from PIL import Image
from vergeml.utils import VergeMLError

@operation('flip-horizontal', topic="image", descr="Horizontally flip an image.")
@option('chance', validate='>=0, <=1', default=1.)
class FlipHorizontalOperation(OperationPlugin):

    def __init__(self, chance:float=1.0, apply=None):
        super().__init__(apply)
        self.chance = chance
    

    def transform_xy(self, x, y, rng):
        if rng.uniform(0.0, 1.0) < self.chance:

            x = x if not isinstance(x, ImageType) else x.transpose(Image.FLIP_LEFT_RIGHT)
            y = y if not isinstance(y, ImageType) else y.transpose(Image.FLIP_LEFT_RIGHT)
         
        return x, y
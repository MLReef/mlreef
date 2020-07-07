from vergeml.img import ImageType
from vergeml.operation import OperationPlugin, operation
from vergeml.option import option
from PIL import Image
from vergeml.utils import VergeMLError
import math

@operation('crop', topic="image", descr="Crop a region of an image at a fixed position.")
@option('x', type='Optional[int]', descr="x coordinate of the rectangle.", validate='>0')
@option('y', type='Optional[int]', descr="y coordinate of the rectangle.", validate='>0')
@option('position', type='Optional[str]', descr="Position of the rectangle",
        validate=("top-left", "top-right", "bottom-left", "bottom-right", "center"), default="center")
@option('width', type=int, descr="Width of the rectangle.", validate='>0')
@option('height', type=int, descr="Height of the rectangle.", validate='>0')
class CropOperation(OperationPlugin):
    type = ImageType

    def __init__(self, width:int, height:int, x:int = None, y:int = None, position:str="center", apply=None):

        super().__init__(apply)

        if bool(x) ^ bool(y):
            raise VergeMLError("Must specify both x and y when using absolute coordinates")

        VALID_POSITIONS = ("top-left", "top-right", "bottom-left", "bottom-right", "center")
        
        if not position in VALID_POSITIONS:
            raise VergeMLError("position must be one of: {}".format(", ".join(VALID_POSITIONS)))

        self.width = width
        self.height = height
        self.x = x
        self.y = y
        self.position = position
    
    def transform(self, img, rng):
        width, height = img.size

        if width < self.width:
            raise VergeMLError("Can't crop sample with width {} to {}.".format(width, self.width))
        
        if height < self.height:
            raise VergeMLError("Can't crop sample with height {} to {}.".format(height, self.height))

        if self.x or self.y:

            if width < self.width + self.x:
                raise VergeMLError("Can't crop sample with width {} to {} from x {}.".format(width, self.width, self.x))
            if height < self.height + self.y:
                raise VergeMLError("Can't crop sample with height {} to {} from y {}.".format(height, self.height, self.y))
            
            x = self.x
            y = self.y
        
        elif self.position == "top-left":
            x, y = 0,0
        elif self.position == "top-right":
            x, y = width - self.width, 0
        elif self.position == "bottom-left":
            x, y = 0, height - self.height
        elif self.position == "bottom-right":
            x, y = width - self.width, height - self.height
        elif self.position == "center":
            x, y = math.floor(width/2 - self.width/2), math.floor(height/2 - self.height/2)
        
        params = x, y, x + self.width, y + self.height
        return img.crop(params)
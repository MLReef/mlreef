import os.path
import math
from PIL import Image
from PIL.Image import Image as ImageType


INPUT_PATTERNS = ["**/*.jpg", "**/*.jpeg", "**/*.png", "**/*.bmp"]
RESIZE_METHODS = ('nearest', 'box', 'bilinear', 'hamming', 'bicubic', 'lanczos', 'antialias')
# Apple:
# https://developer.apple.com/documentation/uikit/uiview/contentmode
# Keras:
# 'constant': kkkkkkkk|abcd|kkkkkkkk (cval=k)
# 'nearest': aaaaaaaa|abcd|dddddddd
# 'reflect': abcddcba|abcd|dcbaabcd
# 'wrap': abcdabcd|abcd|abcdabcd

RESIZE_MODES = ('fill', 'aspect-fill', 'aspect-fit')

def fixext(path, img):
    """Change the format of files with the wrong extension."""
    path, ext = os.path.splitext(path)

    if img.format:
        return path + "." + img.format.lower()
    elif img.mode == 'RGBA':
        return path + ".png"
    elif ext.lower() not in [".jpg", ".jpeg", ".png", ".bmp"]:
        return path + ".png"
    else:
        return path + ext


def open_image(path):
    """Open image at path.

    PIL lazily opens the image, which can lead to a 'too many open files' error.
    This workaround reads the file into memory immediately."""
    img1 = Image.open(path)
    img2 = img1.copy()
    img1.close()
    return img2

def resize_image(img, width, height, method, mode, bg_color=(0, 0, 0, 0)):
    # Some code from:
    # https://github.com/charlesthk/python-resize-image/blob/master/resizeimage/resizeimage.py
    # Thank you!
    img = img.copy()
    pil_method = getattr(Image, method.upper())

    if mode == 'fill':
        img = img.resize((width, height), pil_method)
    elif mode == 'aspect-fill':
        w,h = img.size
        ratio = max(width / w, height / h)
        nsize = (int(math.ceil(w * ratio)), int(math.ceil(h * ratio)))
        img = img.resize(nsize, pil_method)
        w,h = img.size
        left = (w - width) / 2
        top = (h - height) / 2
        right = w - left
        bottom = h - top
        rect = (int(math.ceil(x)) for x in (left, top, right, bottom))
        img = img.crop(rect)
    elif mode == 'aspect-fit':
        img.thumbnail((width, height), pil_method)
        background = Image.new('RGBA', (width, height), bg_color)
        img_position = (
            int(math.ceil((width - img.width) / 2)),
            int(math.ceil((height - img.height) / 2))
        )
        background.paste(img, img_position)
        img = background.convert('RGB')
    
    return img
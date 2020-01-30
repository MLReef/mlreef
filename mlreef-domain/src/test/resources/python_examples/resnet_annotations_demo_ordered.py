import shutil
import argparse


@data_processor(
    name="Resnet 2.0 Filter",
    author="MLReef",
    type="ALGORITHM",
    description="Transforms images with lots of magic",
    visibility="PUBLIC",
    input_type="IMAGE",
    output_type="IMAGE"
)
@parameter('images_path', "str", True, '.')
@parameter('output_path', "str", True, '.')
@parameter('height', "int", True, 256)
@parameter('width', "int", True, 256)
@parameter('epochs', "int", True, 5)
@parameter('channels', "int", False, 3)
@parameter('use_pretrained', "str", False, 'False')
@parameter('batch_size', "int", False, 32)
@parameter('training_split', 'float', False, .8)
@parameter('validation_split', 'float', False, .2)
@parameter('learning_rate', 'float', False, .0001)
@parameter('loss', 'float', False, 0.1)
def init_parameters():
    pass


if __name__ == '__main__':
    init_parameters()
    color_mode = lambda: 'rbga' if channels == 4 else (
        'grayscale' if channels == 1 else 'rgb')  # handle this potential error
    pass

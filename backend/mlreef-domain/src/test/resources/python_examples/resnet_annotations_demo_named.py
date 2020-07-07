@data_processor(
    name="Resnet 2.0 Filter",
    author="MLReef",
    type="ALGORITHM",
    description="Transforms images with lots of magic",
    visibility="PUBLIC",
    input_type="IMAGE",
    output_type="IMAGE"
)
@parameter(name='images_path', type="str", required=True, defaultValue='.')
@parameter(name='output_path', type="str", required=True, defaultValue='.')
@parameter(name='height', type="int", required=True, defaultValue=256)
@parameter(name='width', type="int", required=True, defaultValue=256)
@parameter(name='epochs', type="int", required=True, defaultValue=5)
@parameter(name='channels', type="int", required=False, defaultValue=3)
@parameter(required=False, defaultValue='False', name='use_pretrained', type="str", )
@parameter(name='batch_size', required=False, type="int", defaultValue=32)
@parameter(defaultValue=0.8, name='training_split', type='float', required=False, )
@parameter(type='float', defaultValue=0.2, name='validation_split', required=False, )
@parameter(name='learning_rate', required=False, defaultValue=.0001, type='float')
@parameter(name='loss', type='float', required=False, defaultValue=0.1)
def init_parameters():
    pass


if __name__ == '__main__':
    init_parameters()
    color_mode = lambda: 'rbga' if channels == 4 else (
        'grayscale' if channels == 1 else 'rgb')  # handle this potential error
    pass

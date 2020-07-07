from annotations.parameter_annotations import parameter
import annotations.parameter_annotations as params


@parameter(name="width", datatype="int", required=False, defaultValue=100)
@parameter(name="height", datatype="int", required=False, defaultValue=200)
@parameter(name="image_name", datatype="str", required=False, defaultValue='SAR')
def inject_variables():
    print("Variables have been injected into the scope of this file")
    pass


if __name__ == '__main__':
    inject_variables()
    print("Width = {} with type {}".format(params.width, type(params.width)))
    print("Height = {} with type {}".format(params.height, type(params.height)))
    print("Image Name = {} with type {}".format(params.image_name, type(params.image_name)))

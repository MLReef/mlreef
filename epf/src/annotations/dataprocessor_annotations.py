import argparse
import sys

# @data_processor(
#     name="Resnet 2.0 Filter",
#     author="MLReef",
#     description="Transforms images with lots of magic",
#     visibility="PUBLIC",
#     inputType="IMAGE",
#     outputType="IMAGE"
# )

class data_processor(object):

    # def __init__(self, type,name, author, description, visibility, input_type, output_type):
    def __init__(self, type, input_type, output_type):
        # self.name = name
        # self.author = author
        # self.description = description
        # self.visibility = visibility
        self.type = type
        self.input_type = input_type
        self.output_type = output_type

    def __call__(self, f):
        def wrapped_function(*args):
            # does nothing yet.
            f(*args)

        return wrapped_function

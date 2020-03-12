import argparse
import sys


class parameter(object):
    def __init__(self, name, datatype, required, default_value, description = ""):
        self.name = name
        self.datatype = datatype
        self.required = required
        self.default_value = default_value
        self.description = description

    def __call__(self, func):

        def wrapped_function(*args):
            
            try:
                 # find in index for argument parsing
                useful_args = sys.argv[1:]
                arg_name = '--{}'.format(self.name)
                index = useful_args.index(arg_name)
                parser = argparse.ArgumentParser(description='Parser for Annotations')
                exec('parser.add_argument(\'{}\', action=\'store\',nargs=\'?\' ,default=\'{}\', type={})'.format(self.name, self.default_value,self.datatype))
                params, __ = parser.parse_known_args(useful_args[index:])
                params = vars(params)
            
                exec('global {}; {} = params[\'{}\']'.format(self.name, self.name, self.name))
                print("EPF: Found param {} (with type:{}, default:{}, and required:{}) in arguments: {}".format(params, self.datatype, self.default_value, self.required, useful_args))
                pass
            except:
                print("EPF: Could not find usable param '{}' (type:{} with default:{}) in arguments: {}".format(self.name, self.datatype, self.default_value, useful_args))
                pass

            func(*args)

        return wrapped_function


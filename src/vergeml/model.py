from vergeml.plugins import PLUGINS
from vergeml.option import Option

_MODEL_META_KEY = '__vergeml_model__'

def model(name, descr=None, long_descr=None):
    """Define a command for your model.

    :param name:        Name of the operation.
    :param descr:       A short description of the operation
    :param long_descr:  A long description
    """
    def decorator(o):
        assert getattr(o, _MODEL_META_KEY, None) is None
        
        options = Option.discover(o)
        cmd = Model(name, 
                    descr=descr, 
                    long_descr=long_descr,
                    options=options)
        setattr(o, _MODEL_META_KEY, cmd)
        return o
    return decorator

class Model:
    def __init__(self, name, descr=None, long_descr=None, options=[], plugins=PLUGINS):
        self.name = name
        self.descr = descr
        self.long_descr = long_descr
        self.options = options
        self.plugins = plugins

    @staticmethod
    def discover(o, plugins=PLUGINS):
        res = None
        if hasattr(o, _MODEL_META_KEY):
            res = getattr(o, _MODEL_META_KEY)
            res.plugins = plugins
            for option in res.options:
                option.plugins = plugins
        return res


class ModelPlugin:

    def __init__(self, name, plugins=PLUGINS):
        self.name = name
        self.model = None
        self.plugins = plugins
    
    def load(self, env):
        raise NotImplementedError
    
    def project_file_template(self):
        return f"model: {self.name}" 
        
    def set_defaults(self, cmd, args, env):
        pass
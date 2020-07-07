import builtins
import re
from typing import Union, List, Optional
import vergeml.glossary as glossary
from vergeml.plugins import PLUGINS
from vergeml.utils import VergeMLError, did_you_mean
from copy import deepcopy
from io import IOBase

# types
class TrainedModel: # pylint: disable=R0903
    """A type representing a trained instance of a model."""

class File: # pylint: disable=R0903
    """A type representing a file that can be read"""

_RESERVED_OPTION_NAMES = {
    'version', 'file', 'model', 'samples-dir', 'val-split', 'test-split', 'cache-dir', 'random-seed',
    'trainings-dir', 'project-dir', 'cache', 'device', 'device-memory'
}

_RESERVED_SHORT_OPTION_NAMES = {'v', 'f', 'm'}

def option(name, default=None, descr=None, type=None, validate=None, transform=None,
           long_descr=None, alias=None, short=None, flag=False, yaml_only=False, subcommand=False,
           command_line=False):
    """Defines an option.

        :param name:        Name of the option.
        :param default:     Default value of the option.
        :param type:        Type of the option. Can be either a python type or a string representing the type.
                            Supported types are:
                                - int
                                - float
                                - str
                                - bool
                                - NoneType
                                - dict
                                - list
                                - TrainedModel (shortcut '@'')
                                - file
                                - List[<int, float, str>]
                                - Optional[<any of above>]
                                - Union[<any of the above>]
        :param validate:    How to validate the option. Can take the following values:
                                - a string expression using >, <, >= or <=, e.g. '>=0'
                                - a list of possible values
                                - a function which accepts a option definition and a value as options.
                                - None
        :param transform:   Defines a transformation to apply before casting.
        :param descr:       A short description of the option.
        :param long_descr:  A long description.
        :param flag:        For boolean options only: use short form --x for True
        :param short:       An optional short flag, like -oadam
        :param yaml_only:   When true, can only be set via yaml file.
        :param command_line:When true, this argument is only relevant when running on the command line
        :param subcommand:  If true, the option is a subcommand and is parsed as command:subcommand
        """


    def decorator(o):
        if o.__name__ not in ('ValidateDevice', 'ValidateData'):
            assert name not in _RESERVED_OPTION_NAMES, "Invalid option name: {} - name is reserved.".format(name)
            assert short not in _RESERVED_SHORT_OPTION_NAMES, \
                "Invalid short option name {} for option: {} - name is reserved.".format(short, name)

        assert getattr(o, _CMD_META_KEY, None) is None, _DECORATORS_WRONG_ORDER

        if not hasattr(o, _OPTIONS_META_KEY):
            setattr(o, _OPTIONS_META_KEY, [])
        options = getattr(o, _OPTIONS_META_KEY)
        option = Option(name=name,
                        default=default,
                        type=type,
                        validate=validate,
                        transform=transform,
                        descr=descr,
                        long_descr=long_descr,
                        alias=alias,
                        short=short,
                        flag=flag,
                        yaml_only=yaml_only,
                        command_line=command_line,
                        subcommand=subcommand)
        options.append(option)
        return o
    return decorator

_OPTIONS_META_KEY = '__vergeml_options__'
_CMD_META_KEY = '__vergeml_command__'
_DECORATORS_WRONG_ORDER = """
You must first define the command and then the parameters, for example:

@command('train')
@param('learning-rate')
def train():
    ...
""".strip()

_VALIDATE_REGEX = r"^(<|>|>=|<=)([0-9][0-9]*(\.[0-9]*)?)$"
class Option:
    def __init__(self, name, default=None, type=None, validate=None, transform=None, descr=None, long_descr=None,
                 alias=None, short=None, flag=False, yaml_only=False, command_line=False, subcommand=False, plugins=PLUGINS):
        """Defines an option.

        See the documentation of the function option.
        """
        if isinstance(validate, str):
            for val in validate.split(","):
                val = val.strip()
                assert re.match(_VALIDATE_REGEX, val)

        self.name = name
        self.default = default

        # as a shortcut, type can be a string.
        if isinstance(type, str):

            # @ is a shortcut for a trained model
            type = type.replace("@", "TrainedModel")

            # convert the string to an object representing the type
            type = eval(type) # pylint: disable=W0123

        self.type = type
        if not self.type and default is not None:
            self.type = builtins.type(default)

        self.validate = validate
        self.transform = transform
        self.descr = descr or glossary.short_param_descr(name)
        self.long_descr = long_descr or glossary.long_descr(name)
        self.alias = alias
        self.plugins = plugins
        self.short = short
        self.flag = flag
        self.yaml_only = yaml_only
        self.command_line = command_line
        self.subcommand = subcommand

    @staticmethod
    def discover(o, plugins=PLUGINS):
        res = []
        if hasattr(o, _OPTIONS_META_KEY):
            res = deepcopy(getattr(o, _OPTIONS_META_KEY))
            for r in res:
                r.plugins = plugins
        return res

    def _invalid_value(self, value, suggestion=None):

        return VergeMLError(f"Invalid value for option {self.name}.", suggestion, hint_type='value', hint_key=self.name)

    def has_type(self, *types):
        """Check if the option is of a type in the list types"""
        return _has_type(self.type, *types)

    def validate_value(self, value):
        if not self.validate:
            return

        if not self.is_required() and value in (None, 'null', 'Null', 'NULL'):
           return

        if isinstance(self.validate, (tuple, list)) and value not in self.validate:
            suggestion = None
            if all(map(lambda e: isinstance(e, str), self.validate)):
                suggestion = did_you_mean(self.validate, value)
            raise self._invalid_value(value, suggestion)
        elif callable(self.validate):
            self.validate(self, value)
        elif isinstance(self.validate, str):
            for validate in self.validate.split(","):
                validate = validate.strip()
                try:
                    value = float(value)
                except ValueError:
                    raise self._invalid_value(value)
                op, num_str = re.match(_VALIDATE_REGEX, validate).group(1,2)
                num = float(num_str)
                if op == '>':
                    if not value > num:
                        raise self._invalid_value(value, f"Must be greater than {num_str}")
                elif op == '<':
                    if not value < num:
                        raise self._invalid_value(value, f"Must be less than {num_str}")
                if op == '>=':
                    if not value >= num:
                        raise self._invalid_value(value, f"Must be greater or equal to {num_str}")
                elif op == '<=':
                    if not value <= num:
                        raise self._invalid_value(value, f"Must be less than or equal to {num_str}")

    def cast_value(self, value, type_=None): # pylint: disable=R0915,R0911,R0912
        """Cast value to the type of option.
        """
        type_ = type_ or self.type

        if not type_:
            return value

        if _has_type(type_, '@', 'Optional[@]') and isinstance(value, (str, int, float, bool)):
            return str(value)

        if _has_type(type_, 'Optional[@]') and value is None:
            return value

        if _has_type(type_, 'List[@]'):
            if isinstance(value, list) and all(map(lambda e: isinstance(e, str), value)):
                return value

            raise ValueError("Could not cast to trained model.")

        if _has_type(type_, '@', 'Optional[@]'):

            raise ValueError("Could not cast to trained model.")

        if _has_type(type_, 'File'):
            if isinstance(value, str):
                return value

            raise ValueError("Could not cast to file.")

        if _has_type(type_, 'Optional[File]'):
            if isinstance(value, str) or value is None:
                return value

            raise ValueError("Could not cast to file")

        if _has_type(type_, 'List[File]'):
            if isinstance(value, list) and all(map(lambda e: isinstance(e, str), value)):
                return value

            raise ValueError("Could not cast to file")

        if _has_type(type_, int):
            try:
                if isinstance(value, (int, float, str)) and not isinstance(value, bool):
                    return int(value)

                raise ValueError("Could not cast to int")
            except ValueError:
                raise self._invalid_value(value)

        if _has_type(type_, float):
            try:
                if isinstance(value, (int, float, str)) and not isinstance(value, bool):
                    return float(value)

                raise ValueError("Could not cast to float")
            except ValueError:
                raise self._invalid_value(value)

        if _has_type(type_, str):
            try:
                if isinstance(value, (int, float, str)) and not isinstance(value, bool):
                    return str(value)

                raise ValueError("Could not cast to str")
            except ValueError:
                raise self._invalid_value(value)

        if _has_type(type_, bool):
            if isinstance(value, bool):
                return value
            if value in  ('y', 'Y', 'yes', 'Yes', 'YES',
                          'on', 'On', 'ON',
                          'true', 'True', 'TRUE'):
                return True
            if value in  ('n', 'N', 'no', 'No', 'NO',
                          'off', 'Off', 'OFF',
                          'false', 'False', 'FALSE'):
                return False
            raise self._invalid_value(value)

        if type_ == type(None):
            if isinstance(value, type(None)):
                return value
            if isinstance(value, str) and value in ('null', 'Null', 'NULL'):
                return None
            raise self._invalid_value(value)

        if _has_type(type_, dict):
            if not isinstance(value, dict):
                raise self._invalid_value(value)
            return value

        if _has_type(type_, list):
            if not isinstance(value, list):
                raise self._invalid_value(value)

            if hasattr(type_, '__origin__'):
                return [self.cast_value(i, type_.__args__[0]) for i in value]

            return value

        if getattr(type_, '__origin__', None) == Union:
            res = None
            found = False
            for typ in type_.__args__:
                try:
                    res = self.cast_value(value, typ)
                    found = True
                    break
                except VergeMLError:
                    pass
            if not found:
                raise self._invalid_value(value)
            return res

        # Unknown type
        assert False
        return None


    def transform_value(self, value):
        if self.transform:
            return self.transform(value)
        else:
            return value

    def has_optional_type(self):
        """Check if the type of the option permits None values.
        """
        return getattr(self.type, '__origin__', None) == Union and \
               type(None) in self.type.__args__ # pylint: disable=C0123

    def is_optional(self):
        return self.default is not None or self.has_optional_type()

    def is_required(self):
        return not self.is_optional()

    def is_at_option(self):
        return self.name.startswith("@")

    def is_argument_option(self):
        return self.name.startswith("<") and self.name.endswith(">")


    def _type_descr(self, tp):
        tp_descr = ""

        if tp == TrainedModel:
            tp_descr = "trained model"
        elif tp == Optional[TrainedModel]:
            tp_descr = "optional trained model"
        elif tp == File:
            tp_descr = "file"
        elif tp == Optional[File]:
            tp_descr = "optional file"
        elif tp == List[File]:
            tp_descr = "a list of files"

        elif hasattr(tp, '__origin__'):
            if tp.__origin__ in (list, List):
                tp_descr = "a list of " + self._type_descr(tp.__args__[0])
            elif tp.__origin__ == Union:
                if len(tp.__args__) == 2 and type(None) in tp.__args__:
                    other = list(filter(lambda t: not isinstance(t, type(None)), tp.__args__))[0]
                    tp_descr = 'optional ' + self._type_descr(other)
                else:
                    names = [self._type_descr(t) for t in tp.__args__]
                    if len(names) <= 2:
                        tp_descr = " or ".join(names)
                    else:
                        tp_descr = ", ".join(names[:-1])
                        tp_descr += " or " + names[-1]
        elif tp:
            if tp == str:
                tp_descr = "string"
            else:
                tp_descr = getattr(tp, '__name__', str(tp))
        return tp_descr

    def human_type(self):
        tp_descr = self._type_descr(self.type)

        if tp_descr and isinstance(self.validate, str):
            tp_descr += " " + self.validate

        elif tp_descr and isinstance(self.validate, (tuple, list)):
            tp_descr = "one of (" + ", ".join(map(lambda e: str(e), self.validate)) + ")"

        if self.default:
            tp_descr += ", default: " + str(self.default)

        return tp_descr


def _has_type(type_, *types):

    for typ in types:

        if isinstance(typ, str):
            typ = typ.replace('@', 'TrainedModel')
            typ = eval(typ) # pylint: disable=W0123

        if type_ == typ:
            return True

        if typ in (list, List) and getattr(type_, '__name__', None) == 'List':
            return True

    return False

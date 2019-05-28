"""Parse configuration files.
"""

from copy import deepcopy
import re

import yaml

from vergeml.utils import VergeMLError, did_you_mean
from vergeml.plugins import PLUGINS
from vergeml.io import Source
from vergeml.operation import Operation

def parse_device(section, device_id=None, device_memory=None):
    """Parse the device section of the config file.
    """
    section = deepcopy(section or {})

    # As a shortcut, device can be set directly, e.g. device: gpu:1
    # This is equivalent to saying
    # device:
    #   id: gpu:1

    if isinstance(section, str):
        section = {'id': section}

    # If --device is set from the command line, it overrides the YAML file.
    if device_id:
        section['id'] = device_id

    # Override --memory flag
    if device_memory:
        section['memory'] = device_memory

    res = {
        'id': 'auto',
        'memory': 'auto',
        'grow-memory': True
    }

    # First, raise an error if an unknown option is encountered
    _raise_unknown_option('device', res.keys(), section.keys(), 'device')

    _parse_device_id(res, section)

    _parse_device_memory(res, section)

    _parse_device_grow_memory(res, section)

    return res

def _parse_device_id(res, section):
    """Parse the id option in the device section.
    """
    if 'id' in section:

        value = section['id'].strip()

        if not re.match(r"^(gpu:[0-9]+|gpu|cpu|auto)", value):
            raise _invalid_option('device.id', 'device')

        if value == 'gpu':
            value = 'gpu:0'

        res['id'] = value

def _parse_device_memory(res, section):
    """Parse the memory option in the device section.
    """
    if 'memory' in section:

        value = section['memory'].strip()

        if isinstance(value, float):
            if value < 0. or value > 1.:
                raise _invalid_option('device.memory', 'device')

            res['memory'] = value


        if value != 'auto':
            if not re.match(r'^[0-9]+(\.[0-9]*)?%$', value):
                raise _invalid_option('device.memory', 'device')

            try:
                value = float(value.rstrip('%'))
            except ValueError:
                raise _invalid_option('device.memory', 'device')

            if value < 0. or value > 100.:
                raise _invalid_option('device.memory', 'device')

            res['memory'] = value/100

def _parse_device_grow_memory(res, section):
    """Parse the grow-memory option in the device section.
    """
    if 'grow-memory' in section:

        try:
            value = bool()
        except ValueError:
            raise _invalid_option('device.grow-memory', 'device')

        res['grow-memory'] = value


def parse_data(section, cache=None, plugins=PLUGINS):
    """Parse the data section of the config file.
    """
    section = deepcopy(section or {})

    # There are several shortcuts when setting up data.

    # First, one can just specify the input plugin as a value of the data option
    if isinstance(section, str):
        section = {'input': {'type': section}}

    # input and output can be set directly too
    for k in ('input', 'output'):
        if isinstance(section.get(k), str):
            section[k] = {'type': section[k]}

    # Override --cache flag
    if cache:
        section['cache'] = cache

    res = {
        'cache': 'auto',
        'preprocess': []
    }

    # Raise an error if an unknown option is encountered
    _raise_unknown_option('data', ('input', 'output', 'cache', 'preprocess'),
                          section.keys(), 'data')

    _parse_data_cache(res, section)

    _parse_data_source(res, section, 'input', plugins)

    _parse_data_source(res, section, 'output', plugins)

    _parse_data_preprocess(res, section, plugins)

    return res


_VALID_CACHE_VALUES = ('none', 'mem', 'disk', 'mem-in', 'disk-in', 'auto')
def _parse_data_cache(res, section):

    if 'cache' in section:
        value = section['cache']

        if not value in _VALID_CACHE_VALUES:

            suggestion = did_you_mean(_VALID_CACHE_VALUES, value)
            raise _invalid_option('data.cache', help_topic='cache', suggestion=suggestion)
        res['cache'] = value


def _parse_data_source(res, section, key, plugins):

    if key in section:
        source_section = section[key]

        # Type must be set explicitly when input or output is specified in the config file.
        if not 'type' in source_section:
            raise VergeMLError(f"Missing option 'type'.",
                               suggestion='Please specify the {key} type of your data',
                               help_topic='data', hint_type='key', hint_key=f'data.{key}')

        type_ = source_section['type']
        res[key] = {'type': type_}

        # Find the source definition
        plugin = plugins.get("vergeml.io", type_)

        if not plugin:
            suggestion = did_you_mean(plugins.keys('vergeml.io'), type_)
            raise _invalid_option(f"data.{key}.type",
                                  help_topic='data',
                                  suggestion=suggestion)

        source = Source.discover(plugin)

        # check for unknown options
        _raise_unknown_option(f'data.{key}', map(lambda o: o.name, source.options),
                              set(source_section.keys()) - set(['type']), 'data')

        options = list(filter(lambda o: o.name != 'type', source.options))

        # validate and transform each option
        for option in options:
            try:

                if option.name in source_section:
                    value = source_section[option.name]
                    value = option.cast_value(value)
                    value = option.transform_value(value)
                    option.validate_value(value)
                    res[key][option.name] = value

                # deal with missing options
                elif option.is_required():
                    raise VergeMLError(f"Missing option '{option.name}'.",
                                       suggestion=f'Please add the missing option.',
                                       help_topic='data', hint_type='key', hint_key=f'data.{key}')
                elif option.default:
                    res[key][option.name] = option.default


            except VergeMLError as err:
                err.hint_key = f'data.{key}.{option.name}'
                raise err




def _parse_data_preprocess(res, section, plugins):
    if 'preprocess' in section:

        pre_section = section['preprocess']

        if not isinstance(pre_section, list):
            message = "Invalid value - must be a list of preprocess operations."
            raise VergeMLError(message,
                               "Please fix the entry in the project file.",
                               help_topic="preprocess",
                               hint_type='key',
                               hint_key='data.preprocess.')

        operations = []
        for index, config in enumerate(pre_section):
            if not isinstance(config, dict):
                raise VergeMLError("Invalid entry in preprocess - must be key value pairs.",
                                   "Please fix the entry in the project file.",
                                   help_topic="preprocess",
                                   hint_type='key',
                                   hint_key='data.preprocess.' + str(index))
            elif not 'op' in config:
                raise VergeMLError("Invalid entry in preprocess - missing 'op' key.",
                                   "Please fix the entry in the project file.",
                                   help_topic="preprocess",
                                   hint_type='key',
                                   hint_key='data.preprocess.' + str(index))
            op_name = config['op']
            plugin = plugins.get("vergeml.operation", op_name)
            if not plugin:
                raise VergeMLError(f"Invalid entry in preprocess - unknown operation '{op_name}'.",
                                   "Please fix the entry in the project file.",
                                   help_topic="preprocess",
                                   hint_type='value',
                                   hint_key=f"data.preprocess.{index}.op")


            operation = Operation.discover(plugin)
            # options = list(filter(lambda o: o.name != 'op', operation.options))#

            # check for unknown options
            _raise_unknown_option(f'data.preprocess.{index}',
                                  [o.name for o in operation.options],
                                  set(config.keys()) - set(['op']), 'preprocess')

            opdict = {'op': op_name}
            for option in operation.options:
                try:
                    if option.name in config:
                        value = config[option.name]

                        value = option.cast_value(value)
                        value = option.transform_value(value)
                        option.validate_value(value)

                        opdict[option.name] = value

                    # deal with missing options
                    elif option.is_required():
                        raise VergeMLError(f"Missing option '{option.name}'.",
                                           suggestion=f'Please add the missing option.',
                                           help_topic='data', hint_type='key',
                                           hint_key=f'data.preprocess.{index}')
                    elif option.default:
                        opdict[option.name] = option.default

                except VergeMLError as err:
                    err.hint_key = f'data.preprocess.{index}.{option.name}'
                    raise err


            operations.append(opdict)
        res['preprocess'] = operations


def parse_command(command, section):
    """Parse a command in the config file.
    """
    section = section or {}
    res = {}
    subk = []

    sub_option = next(filter(lambda c: c.subcommand, command.options), None)

    if sub_option:
        subk = list(command.plugins.keys(sub_option.subcommand))

    _raise_unknown_option(command.name, [o.name for o in command.options] + subk,
                          section.keys(), command.name)

    for option in command.options:

        if option.name in section:
            value = section[option.name]
            value = option.cast_value(value)
            value = option.transform_value(value)
            option.validate_value(value)
            res[option.name] = value

    return res


def _raise_unknown_option(key, valid, options, help_topic):

    unknown = list(set(options) - set(valid))

    if bool(unknown):
        first = unknown[0]
        suggestion = did_you_mean(valid, first)
        raise _invalid_option(f'{key}.{first}', help_topic=help_topic,
                              suggestion=suggestion, kind='key')



def _invalid_option(key, help_topic=None, suggestion=None, kind='value'):
    label = "Invalid value for option" if kind == 'value' else "Invalid option"
    return VergeMLError(f"{label} '{key}'.", suggestion, help_topic=help_topic,
                        hint_type=kind, hint_key=key)



def load_yaml_file(filename, label='config file', loader=yaml.Loader):
    """Load a yaml config file.
    """
    try:
        with open(filename, "r") as file:
            res = yaml.load(file.read(), Loader=loader) or {}
            if not isinstance(res, dict):
                msg = f"Please ensure that {label} consists of key value pairs."
                raise VergeMLError(f"Invalid {label}: {filename}", msg)
            return res
    except yaml.YAMLError as err:
        if hasattr(err, 'problem_mark'):
            mark = getattr(err, 'problem_mark')
            problem = getattr(err, 'problem')
            message = f"Could not read {label} {filename}:"
            message += "\n" + display_err_in_file(filename, mark.line, mark.column, problem)
        elif hasattr(err, 'problem'):
            problem = getattr(err, 'problem')
            message = f"Could not read {label} {filename}: {problem}"
        else:
            message = f"Could not read {label} {filename}: YAML Error"

        suggestion = f"There is a syntax error in your {label} - please fix it and try again."

        raise VergeMLError(message, suggestion)

    except OSError as err:
        msg = "Please ensure the file exists and you have the required access privileges."
        raise VergeMLError(f"Could not open {label} {filename}: {err.strerror}", msg)


class _YAMLAnalyzer(yaml.reader.Reader, yaml.scanner.Scanner):

    def __init__(self, stream):
        yaml.reader.Reader.__init__(self, stream)
        yaml.scanner.Scanner.__init__(self)

def _get_location(ann, key, kind):
    mark = ann.get_mark()

    # try to mark the value
    if kind == 'value':
        if isinstance(ann.peek_token(), yaml.ValueToken):
            # forward to the next token
            tok = ann.get_token()
            if isinstance(ann.peek_token(), yaml.ScalarToken):
                # forward again
                tok = ann.get_token()
                length = len(tok.value)
                return (mark.line, mark.column + 1, length)

    length = len(key) + 1
    return (mark.line, max(0, mark.column - length), length)

def yaml_find_definition(stream, key, kind='key'): # pylint: disable=R0912
    """Find the location of the definition of key in the YAML source.
    """
    assert kind in ('key', 'value')
    keys = list(map(lambda k: int(k) if k.isdigit() else k, key.split(".")))
    level = -1
    matches = [False] * len(keys)
    indices = []

    ann = _YAMLAnalyzer(stream)

    tok = ann.get_token()
    while tok: # pylint: disable=R1702
        if isinstance(tok, (yaml.BlockMappingStartToken, yaml.BlockSequenceStartToken)):
            level += 1
            indices.append(0)
        elif isinstance(tok, yaml.ValueToken) and \
             isinstance(ann.peek_token(), yaml.BlockEntryToken):
            level += 1
            indices.append(0)
            # this is a special case since no start and end tokens are emitted for a simple list
            tok = ann.get_token()
            while tok:
                if isinstance(tok, yaml.BlockEntryToken):
                    if 0 <= level < len(keys) and isinstance(keys[level], int):
                        if keys[level] == indices[level] and all(matches[:level]):
                            matches[level] = True
                            if all(matches):
                                return _get_location(ann, str(keys[-1]), kind)
                    indices[level] += 1
                elif not isinstance(tok, (yaml.ScalarToken, yaml.ValueToken)):
                    break

        elif isinstance(tok, yaml.BlockEndToken):
            level -= 1
            indices.pop()
        elif isinstance(tok, yaml.KeyToken) and 0 <= level < len(keys) and \
             isinstance(keys[level], str):
            name = ann.get_token().value

            if name == keys[level] and all(matches[:level]):
                matches[level] = True
                if all(matches):
                    return _get_location(ann, keys[-1], kind)

        elif isinstance(tok, yaml.BlockEntryToken):

            if 0 <= level < len(keys) and isinstance(keys[level], int):
                if keys[level] == indices[level] and all(matches[:level]):
                    matches[level] = True
                    if all(matches):
                        return _get_location(ann, keys[-1], kind)

            indices[level] += 1

        tok = ann.get_token()
    return None

def display_err_in_file(filename, line, column, message, length=1, nlines=3): # pylint: disable=R0913
    """Mark the source code error location in file and return a string for display"""
    with open(filename, "r") as file:
        return _display_err(filename, line, column, message, length, nlines, file.read())


def _display_err(filename, line, column, message, length, nlines, content): # pylint: disable=R0913
    """Mark the source code error location in content and return a string for display"""
    lines = content.splitlines()
    start = max(0, line+1-nlines)
    res = [f"File {filename}, line {line+1}:{column+1}"]
    res.append(str('-' * (len(res[0]) + 7)))
    res += lines[start:line+1]
    res += [(' ' * column) + ("^" * length), message]
    return "\n".join(res)

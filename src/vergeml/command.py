"""Classes and functions to define commands.
"""
import inspect
import getopt

from copy import deepcopy

from vergeml.plugins import PLUGINS
from vergeml.utils import did_you_mean, VergeMLError, parse_trained_models
from vergeml.option import Option
from vergeml.config import parse_command


_CMD_META_KEY = '__vergeml_command__'


class _CommandCallProxy:
    """Proxy calling commands to setup the environment.
    """

    def __init__(self, cmd, obj):
        self.__cmd__ = cmd
        self.__wrapped_obj__ = obj


    @staticmethod
    def _wrap_call(cmd, fun, args, env):
        fn_args = deepcopy(args)

        config_name = cmd.name

        if env.current_command:

            # find the previous command and check for sub option
            sub_option = next(filter(lambda c: c.subcommand, env.current_command[0].options), None)

            if sub_option and args.get(sub_option.name) == cmd.name:
            # we are a sub command
                config_name = env.current_command[0].name + '.' + cmd.name

        # Free form commands deal with this manually
        if not cmd.free_form:
            # If existent, read settings from the config file
            config = parse_command(cmd, env.get(config_name))

            # Set missing args from the config file
            for k, arg in config.items():
                fn_args.setdefault(k, arg)

            # Set missing args from default
            for opt in cmd.options:
                if opt.name not in fn_args and (opt.default is not None or not opt.is_required()):
                    fn_args[opt.name] = opt.default

            # When required arguments are missing now, raise an error
            for opt in cmd.options:
                if opt.is_required() and opt.name not in fn_args:

                    # TODO show --name only when called via the command line
                    raise VergeMLError(f'Missing argument --{opt.name}.', help_topic=cmd.name)

        # Let the environment know about the name of the command being
        # executed
        env.current_command = (cmd, fn_args)

        # Set up defaults for the command. This will also give models a chance
        # to alter the configuration of the environment before command
        # execution.

        env.set_defaults(cmd.name, fn_args)

        return fun(fn_args, env)

    @staticmethod
    def class_wrapper(klass, name):
        """Wraps a class command.
        """
        def _wrapper(*args, **kwargs):
            return _CommandCallProxy(name, klass(*args, **kwargs))
        return _wrapper

    def __call__(self, args, env):
        return _CommandCallProxy._wrap_call(
            self.__cmd__, self.__wrapped_obj__, args, env)

    def __getattr__(self, name):
        if name in ('__wrapped_obj__', '__cmd__'):
            raise AttributeError()

        return getattr(self.__wrapped_obj__, name)

    def __setattr__(self, name, value):
        if name in ('__wrapped_obj__', '__cmd__'):
            self.__dict__[name] = value
        else:
            setattr(self.__wrapped_obj__, name, value)

    @staticmethod
    def function_wrapper(fun, name):
        """Wraps a function command.
        """
        def _wrapper(*fn_args):
            *self_, args, env = fn_args
            # when we get a self argument, bind the function
            _fun = fun.__get__(self_[0]) if self_ else fun

            return _CommandCallProxy._wrap_call(name, _fun, args, env)

        return _wrapper



def command(name=None, # pylint: disable=R0913
            descr=None,
            long_descr=None,
            examples=None,
            free_form=False,
            type='command'): # pylint: disable=W0622

    """Define a model command.

    :param name:        An optional name of the command. Defaults to the name of the function.
    :param descr:       A short description of the command
    :param long_descr:  A long description
    :param examples:    Usage examples
    :param free_form:   When true, only the @AI parameters are parsed- the rest of the arguments
                        are passed as array.
    """
    def decorator(obj):
        # make sure that a command is not defined more than once
        assert getattr(obj, _CMD_META_KEY, None) is None

        # name defaults to the functions name
        _name = name or getattr(obj, '__name__', None)

        # construct the command with options and attach it to obj
        options = list(reversed(Option.discover(obj)))
        cmd = Command(_name,
                      descr=descr,
                      long_descr=long_descr,
                      examples=examples,
                      options=options,
                      free_form=free_form,
                      type=type)

        if inspect.isclass(obj):
            setattr(obj, _CMD_META_KEY, cmd)
            _wrapper = _CommandCallProxy.class_wrapper(obj, cmd)
        else:
            _wrapper = _CommandCallProxy.function_wrapper(obj, cmd)

        setattr(_wrapper, _CMD_META_KEY, cmd)

        return _wrapper

    return decorator

def train(name=None, descr=None, long_descr=None, examples=None, free_form=False):
    """Define a training command.

    See `command` for parameter documentation."""
    return command(name=name, descr=descr, long_descr=long_descr, examples=examples,
                   free_form=free_form, type='train')

def predict(name=None, descr=None, long_descr=None, examples=None, free_form=False):
    """Define a prediction command.

    See `command` for parameter documentation."""
    return command(name=name, descr=descr, long_descr=long_descr, examples=examples,
                   free_form=free_form, type='predict')

class Command: # pylint: disable=R0902
    """A command can be called directly from the command line.
       It is either a vergeml.cmd plugin or a model command."""

    def __init__(self, # pylint: disable=R0913
                 name, descr=None, long_descr=None, examples=None, free_form=False,
                 type='command', options=None, plugins=PLUGINS): # pylint: disable=W0622
        """Construct a command.

        See the documentation of the decorator function ´command`.
        """
        self.name = name
        self.descr = (descr or long_descr or "")
        self.long_descr = (long_descr or descr or "")
        self.examples = examples
        self.options = options or []
        self.plugins = plugins
        self.type = type
        self.free_form = free_form

        at_option = list(filter(lambda o: o.is_at_option(), options))
        assert len(at_option) <= 1, "Can only have one @option."
        if at_option:
            at_option = at_option[0]
            assert at_option.has_type(None, list, '@', 'Optional[@]', 'List[@]')

        arg_param = list(filter(lambda o: o.is_argument_option(), options))
        assert len(arg_param) <= 1, "Can only have one argument parameter."


    @staticmethod
    def discover(obj, plugins=PLUGINS):
        """Discover the command configuration defined on a method or object."""
        res = None
        if hasattr(obj, _CMD_META_KEY):
            res = getattr(obj, _CMD_META_KEY)
            res.plugins = plugins
            for option in res.options:
                option.plugins = plugins
        return res


    @staticmethod
    def find_functions(obj):
        """Find all functions of an object or class that define a command."""
        # get all functions defined by the model
        fns = [m[1] for m in inspect.getmembers(obj) if not m[0].startswith("_") and callable(m[1])]

        # sort by the order defined in code
        fns = list(sorted(fns, key=lambda f: f.__code__.co_firstlineno))

        # filter methods where a command is defined
        fns = filter(lambda f: hasattr(f, _CMD_META_KEY), fns)

        return list(fns)


    def usage(self, short=False, parent_command=None):
        """Get the command usage.

        :param short: Return a short version of the command usage."""
        opt = self._usage_partition_options()

        if self.long_descr and not short:
            result = self.long_descr.strip() + "\n\n"
        else:
            result = ""

        result += "Usage:\n  ml"
        result += self._usage_command(opt, parent_command)
        result += self._usage_options(opt)


        if self.examples and not short:
            result += "\n\nExamples:\n"
            result += "\n".join(map(lambda l: "  " + l, self.examples.splitlines()))

        return result

    def _usage_partition_options(self):
        res = dict(
            at=None,
            arg=None,
            sub=None,
            mandatory=[],
            optional=[]
        )

        for option in self.options:
            if option.is_at_option():
                res['at'] = option
            elif option.is_argument_option():
                res['arg'] = option
            elif bool(option.subcommand):
                res['sub'] = option
            elif option.is_optional():
                res['optional'].append(option)
            else:
                res['mandatory'].append(option)

        return res

    def _usage_command(self, opt, parent_command):
        result = ""
        if opt['at']:
            if opt['at'].has_type(list, 'List[@]'):
                result += f" [{opt['at'].name} ...]"
            elif opt['at'].is_optional():
                result += f" [{opt['at'].name}]"
            else:
                result += f" {opt['at'].name}"

        result += f" {parent_command}:{self.name}" if parent_command else " " + self.name

        if opt['sub']:
            result += f":{opt['sub'].name}"

        if opt['mandatory']:
            val = " ".join(map(lambda o: f"--{o.name}=<{o.name}>", opt['mandatory']))
            result += f" {val}"

        if opt['optional']:
            result += " [options]"

        if opt['arg']:
            if opt['arg'].has_type(str, list):
                result += f" [{opt['arg'].name} ...]"
            elif opt['arg'].is_optional():
                result += f" [{opt['arg'].name}]"
            else:
                result += f" {opt['arg'].name}"
        return result

    def _usage_options(self, opt):
        result = ""

        indent = 2
        n_spaces = 4

        opt_descr = []
        opt_descr = self._usage_opt_descr(opt)

        if opt_descr:
            max_name = max(map(lambda o: len(o[0]), opt_descr))

            result += "\n\nOptions:"
            for k, val in opt_descr:
                result += "\n" + str(indent * ' ')
                space = (max_name + n_spaces) - len(k)
                if val:
                    result += k + str(space * ' ') + val
                else:
                    result += k

        if opt['sub']:
            plugins = self.plugins.all(opt['sub'].subcommand)
            max_name = max(map(len, plugins.keys())) if plugins.keys() else 0
            name = opt['sub'].name.capitalize() + "s"
            if plugins.keys():
                result += f"\n\n{name}:"
                for k, val in plugins.items():
                    result += "\n" + str(indent * ' ')
                    space = (max_name + n_spaces) - len(k)
                    cmd = Command.discover(val)
                    if cmd.descr:
                        result += k + str(space * ' ') + cmd.descr
                    else:
                        result += k
        return result

    def _usage_opt_descr(self, opt):

        opt_descr = []

        if opt['at']:
            if opt['at'].has_type(list, 'List[@]'):
                opt_descr.append((opt['at'].name, "A list of trained models."))
            else:
                opt_descr.append((opt['at'].name, "The name of a trained model."))

        for option in self.options:
            if option.is_at_option() or option.is_argument_option() or bool(option.subcommand):
                continue
            opt_name = "--" + option.name
            if option.short:
                opt_name = "-" + option.short + ", " + opt_name
            descr = (option.descr or "")
            if option.default is not None:
                if isinstance(option.default, bool):
                    default_str = 'true' if option.default else 'false'
                else:
                    default_str = str(option.default)
                if descr:
                    descr += " "
                descr += f"[default: {default_str}]"
            opt_descr.append((opt_name, descr))

        if opt['arg'] and opt['arg'].descr:
            opt_descr.append((opt['arg'].name, opt['arg'].descr or ""))

        return opt_descr


    def parse(self, argv):
        """Parse command line options."""
        res = {}
        at_names, rest = parse_trained_models(argv)

        # in case of a subcommand, parse it and return the result
        sub_res = self._parse_subcommand(argv, rest)
        if sub_res is not None:
            return sub_res

        # Deal with @name options
        at_opt = self._parse_at_option(at_names, res)

        # command name
        assert self.name == rest.pop(0)

        # in case of free form commands, just return @names and the rest
        if self.free_form:
            return (res.get(at_opt.name) if at_opt else None, rest)

        # parse options
        args, extra = self._parse_opts(rest)

        # parse arguments
        self._parse_arguments(extra, res)

        # validate
        self._parse_validate(args, res)

        return res

    def _parse_subcommand(self, argv, rest):

        sub_option = next((filter(lambda o: bool(o.subcommand), self.options)), None)

        if sub_option:
            if not ":" in rest[0]:
                raise VergeMLError(f"Missing {sub_option.name}.", help_topic=self.name)
            cmd_name, sub_name = rest[0].split(":", 1)
            assert cmd_name == self.name
            argv = deepcopy(argv)
            argv[argv.index(rest[0])] = sub_name

            plugin = self.plugins.get(sub_option.subcommand, sub_name)
            if not plugin:
                raise VergeMLError(f"Invalid {sub_option.name}.", help_topic=self.name)

            cmd = Command.discover(plugin)
            try:
                res = cmd.parse(argv)
                res[sub_option.name] = sub_name
                return res
            except VergeMLError as err:
                err.help_topic = f"{cmd_name}:{sub_name}"
                raise err
        else:
            return None

    def _parse_at_option(self, at_names, res):
        at_opt = next((filter(lambda o: o.is_at_option(), self.options)), None)

        if at_opt:
            if at_opt.has_type('@', None):
                at_conf = 'required'
            elif at_opt.has_type('Optional[@]'):
                at_conf = 'optional'
            elif at_opt.has_type(list, 'List[@]'):
                at_conf = 'list'
        else:
            at_conf = 'none'


        if at_conf == 'optional' and len(at_names) > 1:
            # An optional parameter (either specified or not)
            raise _invalid_arguments(help_topic=self.name)

        elif at_conf == 'required' and len(at_names) != 1:
            # A required parameter must be present
            raise _invalid_arguments(help_topic=self.name)

        elif at_conf == 'none' and at_names:
            # No @names
            raise _invalid_arguments(help_topic=self.name)

        if at_conf in ('required', 'optional'):
            res[at_opt.name] = next(iter(at_names), None)
        elif at_conf == 'list':
            res[at_opt.name] = at_names

        return at_opt

    def _parse_opts(self, rest):
        longopts = []
        shortopts = ""

        for opt in self.options:

            # Arguments and @names are dealt with elsewhere.
            if opt.is_at_option() or opt.is_argument_option():
                continue

            # Prepare getopt syntax for long options.
            if opt.flag:
                assert opt.has_type(str, bool)
                longopts.append(opt.name)
            else:
                longopts.append(opt.name + "=")

            # Getopt for short options
            if opt.short:
                assert opt.short not in shortopts

                if opt.has_type(bool):
                    shortopts += opt.short
                else:
                    shortopts += opt.short + ":"

        try:
            # Run getopt. Returns parsed arguments and leftover.
            args, extra = getopt.getopt(rest, shortopts, longopts)

        except getopt.GetoptError as err:

            # in case of an error hint, display a nicer error message.
            if err.opt:
                cand_s = list(shortopts.replace(":", ""))
                cand_l = list(map(lambda o: o.rstrip("="), longopts))
                suggestion = did_you_mean(cand_s + cand_l, err.opt)
                dashes = '-' if len(err.opt) == 1 else '--'
                raise VergeMLError(f"Invalid option {dashes}{err.opt}", suggestion,
                                   help_topic=self.name)
            else:
                raise VergeMLError(f"Invalid option.", help_topic=self.name)

        return args, extra

    def _parse_arguments(self, extra, res):
        opt = next((filter(lambda o: o.is_argument_option(), self.options)), None)

        if opt:

            # Not a list but multiple values.
            if not opt.has_type(list) and len(extra) > 1:
                raise _invalid_arguments(f"Invalid arguments.", help_topic=self.name)

            # Required but no option provided.
            if opt.is_required() and not extra:
                raise _invalid_arguments(f"Missing argument {opt.name}.",
                                         help_topic=self.name)

            # When there is a default value, don't set the value to None.
            if opt.default is not None:
                val = next(iter(extra), None)
                if val is not None:
                    res[opt.name] = val

            # List value.
            elif not opt.has_type(list):
                res[opt.name] = next(iter(extra), None)

            # Other ...
            else:
                res[opt.name] = extra

        elif extra:
            raise _invalid_arguments(help_topic=self.name)


    def _parse_validate(self, args, res):

        shorts_dict = {}
        longs_dict = {}

        for k, val in args:
            if k.startswith("--"):
                longs_dict[k.lstrip("-")] = val
            else:
                shorts_dict[k.lstrip("-")] = val

        for opt in self.options:
            if opt.is_at_option() or opt.is_argument_option():
                continue

            value = None

            if opt.flag:
                value = opt.name in longs_dict
            elif opt.name in longs_dict:
                value = longs_dict[opt.name]

            if opt.short and opt.short in shorts_dict:
                if opt.has_type(bool):
                    value = True
                else:
                    value = shorts_dict[opt.short]

            if value is not None:
                try:
                    value = opt.cast_value(value)
                    value = opt.transform_value(value)
                    opt.validate_value(value)

                    res[opt.name] = value
                except VergeMLError as err:
                    err.message = f"Invalid value for option --{opt.name}."
                    raise err

def _invalid_arguments(message=None, help_topic=None):
    message = message or "Invalid arguments."
    raise VergeMLError(message, help_topic=help_topic)

class CommandPlugin: # pylint: disable=R0903
    """Abstract base class for command plugins."""
    def __init__(self, name, plugins=PLUGINS):
        self.name = name
        self.plugins = plugins

        cmd = Command.discover(self)
        assert cmd
        cmd.name = name

    def __call__(self, argv, env):
        raise NotImplementedError

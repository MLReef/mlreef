"""Code for running from the command line.
"""

import sys
import os.path
import logging
import getopt
import re
from copy import deepcopy, copy

from vergeml import __version__
from vergeml.utils import VergeMLError, parse_trained_models
from vergeml.env import Environment
from vergeml.plugins import PLUGINS
from vergeml.command import Command
from vergeml.commands.help import HelpCommand
from vergeml.utils import did_you_mean
from vergeml.libraries import KerasLibrary, TensorFlowLibrary, TorchLibrary
from vergeml.libraries import NumPyLibrary, PythonInterpreter, CudaLibrary


def _parsebase(argv):
    """Parse until the second part of the command.
    """
    shortopts = 'vf:m:' # version, file, model
    longopts = ['version', 'file=', 'model=', 'samples-dir=', 'test-split=', 'val-split=',
                'cache-dir=', 'random-seed=', 'trainings-dir=', 'project-dir=',
                'cache=', 'device=', 'device-memory=']

    args, rest = getopt.getopt(argv, shortopts, longopts)

    args = dict(args)
    # don't match prefix
    for opt in map(lambda s: s.rstrip("="), longopts):
        # pylint: disable=W0640
        if ''f'--{opt}' in args and not any(map(lambda a: a.startswith('--' + opt), argv)):
            # find the key that does not match
            keys = map(lambda a: a.split("=")[0].lstrip("-"), argv)
            keys = list(filter(lambda k: k in opt, keys))
            if keys:
                raise getopt.GetoptError('Invalid key', opt='--' + keys[0])
            else:
                raise getopt.GetoptError('Invalid key')

    # convert from short to long names
    for sht, lng in (('-v', '--version'), ('-m', '--model'), ('-f', '--file')):
        if sht in args:
            args[lng] = args[sht]
            del args[sht]

    args = {k.strip('-'):v for k, v in args.items()}

    return args, rest


def _env_from_args(args, trained_model, plugins=PLUGINS):
    args = deepcopy(args)
    # replace hyphen with underscore for python
    args = {k.replace('-', '_'):v for k, v in args.items()}

    if trained_model:
        args['trained_model'] = trained_model

    args['is_global_instance'] = True
    args['plugins'] = plugins

    env = Environment(**args)

    return env

def _prepare_args(args):
    """Prepare args by appending the project dir and setting defaults.
    """
    args = deepcopy(args)
    project_dir = args.get('project-dir', '')

    if not 'file' in args:
        default_file = os.path.join(project_dir, "vergeml.yaml")
        if os.path.exists(default_file):
            args['file'] = default_file

    if 'file' in args:
        args['project-file'] = args['file']
        del args['file']

    if 'random-seed' in args:
        try:
            args['random-seed'] = int(args['random-seed'])
        except ValueError:
            raise VergeMLError("Invalid value for --random-seed.",
                               "--random-seed must be an integer value.",
                               ('value', 'random-seed'))

    cache_opts = ('none', 'disk', 'mem', 'disk-in', 'mem-in')

    if 'cache' in args:
        if args['cache'] not in cache_opts:
            raise VergeMLError("Invalid value for --cache.",
                               "Must be one of: " + ", ".join(cache_opts),
                               help_topic='cache')

    if 'device' in args:
        if not re.match(r"^(gpu:[0-9]+|gpu|cpu|auto)", args['device']):
            raise VergeMLError("Invalid value for --device.",
                               "Please specify a valid device, e.g gpu:0 or cpu.",
                               help_topic='device')

    if 'device-memory' in args:
        if not re.match(r"(([1-9]?[0-9]|100)%|(0\.[0-9]+)|1\.0)|auto", args['device-memory']):
            raise VergeMLError("Invalid value for --device-memory.",
                               "Please specify device memory as a percentage, e.g. 100%.",
                               help_topic='device')

    return args

_VERGEML_OPTION_NAMES = {
    'version', 'file', 'model', 'samples-dir', 'val-split', 'test-split', 'cache-dir',
    'random-seed', 'trainings-dir', 'project-dir', 'cache', 'device', 'device-memory'
}

def _forgive_wrong_option_order(argv):
    first_part = []
    second_part = []
    rest = copy(argv)

    while rest:
        arg = rest.pop(0)

        if arg.startswith("--"):
            argname = arg.lstrip("--")
            if "=" in argname:
                argname = argname.split("=")[0]
            is_vergeml_opt = bool(argname in _VERGEML_OPTION_NAMES)
            lst = (first_part if is_vergeml_opt else second_part)

            if arg.endswith("=") or not "=" in arg:
                if not rest:
                    # give up
                    second_part.append(arg)
                else:
                    lst.append(arg)
                    lst.append(rest.pop(0))
            else:
                lst.append(arg)

        else:
            second_part.append(arg)

    return first_part + second_part

def run(argv, plugins=PLUGINS):
    """Run from command line.
    """
    try:
        argv = _forgive_wrong_option_order(argv)
        args, rest = _parsebase(argv)
    except getopt.GetoptError as err:
        if err.opt:
            opt = err.opt.lstrip("-")
            dashes = '-' if len(opt) == 1 else '--'
            raise VergeMLError(f"Invalid option {dashes}{opt}.", help_topic='options')
        else:
            raise VergeMLError(f"Invalid option.", help_topic='options')

    if 'version' in args:
        print_version()
        exit()

    args = _prepare_args(args)
    ai_names, after_names = parse_trained_models(rest)

    AI = next(iter(ai_names), None)

    env = _env_from_args(args, AI, plugins=plugins)

    if after_names:
        cmdname = after_names.pop(0)
    else:
        cmdname = 'help'
        rest = ['help']

    if ":" in cmdname:
        cmdname = cmdname.split(":")[0]

    plugin = None
    cmd_plugin = plugins.get('vergeml.cmd', cmdname)
    if cmd_plugin:
        plugin = cmd_plugin(cmdname, plugins=plugins)
    elif env.model_plugin:
        for model_fn in Command.find_functions(env.model_plugin):
            if cmdname == Command.discover(model_fn).name:
                plugin = model_fn
                break

    if not plugin:
        # collect all possible command names
        command_names = set(plugins.keys('vergeml.cmd'))
        if env.model_plugin:
            model_commands = set(map(lambda f:Command.discover(f).name, Command.find_functions(env.model_plugin)))
            command_names.update(model_commands)

        raise VergeMLError(f"Invalid command '{cmdname}'.",
                           suggestion=did_you_mean(command_names, cmdname),
                           help_topic='*help*')
    try:
        cmd = Command.discover(plugin)
        assert cmd
        args = cmd.parse(rest)

        try:
            # return the result for unit testing
            return plugin(args, env)
        finally:
            if env.training is not None:
                env.cancel_training()

    except KeyboardInterrupt:
        # silence the stacktrace
        pass


def print_version():
    """Print VergeML version and versions of various libraries used.
    """
    print("----------------")
    print(f"VergeML {__version__}")
    print("----------------")
    print("")
    print("Installed Libraries:")
    print("")
    sys.stdout.flush()
    for lib, label in [(PythonInterpreter, 'Python'),
                       (NumPyLibrary, 'Numpy'),
                       (TensorFlowLibrary, 'TensorFlow'),
                       (KerasLibrary, 'Keras'),
                       (TorchLibrary, 'PyTorch'),
                       (CudaLibrary, 'CUDA')]:
        if lib.is_installed():
            version = lib.version()
            print(f"  {label} {version}")
            sys.stdout.flush()
    if CudaLibrary.is_installed():
        print("")
        devices = CudaLibrary.devices_info()
        if not devices:
            print("No CUDA devices found.")
        else:
            print("CUDA devices:")
            for device in devices:
                print("")
                print("\n".join(map(lambda l: "  " + l, device.splitlines())))


def _configure_logging(level=logging.INFO):
    logging.addLevelName(logging.DEBUG, 'Debug:')
    logging.addLevelName(logging.INFO, 'Info:')
    logging.addLevelName(logging.WARNING, 'Warning!')
    logging.addLevelName(logging.CRITICAL, 'Critical!')
    logging.addLevelName(logging.ERROR, 'Error!')

    logging.basicConfig(format='%(levelname)s %(message)s', level=logging.INFO)

    if not sys.warnoptions:
        import warnings
        warnings.simplefilter("ignore")
        # TODO hack to get rid of deprecation warning that appeared allthough filters
        # are set to ignore. Is there a more sane way?
        warnings.warn = lambda *args, **kwargs: None

def main(argv=None, plugins=PLUGINS):
    if argv is None:
        argv = sys.argv[1:]
    _configure_logging()
    try:
        run(argv, plugins=plugins)

    except VergeMLError as e:
        # NOTE- when the error is encountered before the environment is created, it will be empty.
        from vergeml.env import ENV
        # in case there is an error with the config file, but the user just says 'ml help <topic>'
        # where topic is the topic suggested by VergeML, try to display the help message
        # instead of the error the user is experiencing
        if ["help", e.help_topic] == argv:
            help = HelpCommand('help')
            from vergeml.env import ENV
            print(help.get_help(ENV, e.help_topic))
        else:
            # display the error. Can't use logging.error because for an unknown reason pytest does not
            # capture stderr when using logging, so fall back to print
            err_string = str(e).strip()
            print("Error! " + err_string, file=sys.stderr)
            # find all command topics
            commands = list(plugins.keys('vergeml.cmd'))
            if ENV and ENV.model_plugin:
                fns = Command.find_functions(ENV.model_plugin)
                mcommands = list(map(lambda f: Command.discover(f).name, fns))
                commands.extend(mcommands)
            # if the error is just one line and there is command help available, display the help message too.
            if e.help_topic and len(err_string.splitlines()) == 1 and e.help_topic in plugins.keys('vergeml.cmd'):
                print("")
                help = HelpCommand('help')
                help_topic = "" if e.help_topic == "*help*" else e.help_topic
                print(help.get_help(ENV, help_topic, short=True))
            # else just hint at the help topic
            elif e.help_topic:
                print("",  file=sys.stderr)
                help_topic = "" if e.help_topic == "*help*" else " " + e.help_topic
                print(f"See 'ml help" + help_topic + "'.", file=sys.stderr)

    except Exception as err: # pylint: disable=W0703
        if err.__class__.__name__ == 'ResourceExhaustedError':
            print("Error! Your GPU ran out of memory.")
            print("Try lowering resource usage by decreasing model parameters such as batch size.")
        else:
            raise err

if __name__ == "__main__":
    main()
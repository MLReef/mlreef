import vergeml.glossary as glossary
from vergeml.utils import format_info_text, did_you_mean, VergeMLError
from vergeml.command import Command, command, CommandPlugin
from vergeml.option import option
from vergeml.option import Option
from vergeml.operation import Operation
from vergeml.io import Source
from vergeml.model import Model
from vergeml.commands.preprocess import PreprocessCommand
from vergeml.random_robot import random_robot_name, ascii_robot
import webbrowser
import pydoc
import io
import textwrap
import random
import datetime
from typing import Optional

USAGE= """
Usage: ml [--version] [--file=<path>] [--model=<name>] [--samples-dir=<path>]
          [--val-split=<conf>] [--test-split=<conf>] [--cache-dir=<path>]
          [--trainings-dir=<path>] [--project-dir=<path>] [--random-seed=<value>]
          [--cache=<conf>] [--device=<id>] [--device-memory=<conf>]
          [@AI ...] <command> [<args> ...]
""".strip()

HELP_OPTIONS = [
    ('-v, --version',    'Print the version and exit.'),
    ('-f, --file',       'The path to the project file [default vergeml.yaml].'),
    ('-m, --model',      'The model to train.'),
    ('--samples-dir',    'The name of the directory where samples are stored [default: samples].'),
    ('--val-split',      'Validation split configuration [default: 10%].' ),
    ('--test-split',     'Test split configuration [default: 10%].'),
    ('--cache-dir',      'The cache directory [default: .cache].'),
    ('--trainings-dir',  'The name of the directory the training data is written to [default: trainings]'),
    ('--project-dir',    'The path of the project directory [default: the current directory].'),
    ('--random-seed',    'Seed of the random generator [default: 42].'),
    ('--cache',          'How to cache samples during training [default: mem]'),
    ('--device',         'Which device to use for training [default: auto].'),
    ('--device-memory',  'How much device memory to use on a GPU. [default: auto]'),
]


_GENERAL_HELP = [
    ('tutorial', 'Open the quickstart tutorial.'),
    ('options', 'List and describe VergeML options.'),
    ('glossary', 'Show a description of terms and concepts.'),
    ('models', 'List available VergeML models.')
]

_CONFIGURATION_HELP = [
    ('data', 'Describe the data section in the config file.'),
    ('input', 'How to configure sample input.'),
    ('preprocess', 'How to set up sample preprocessing.'),
    ('cache', 'Show cache options.'),
    ('output', 'Describe the data output option.'),
    ('device', 'How to configure CPU and GPU usage.')
]

_TUTORIAL_URL = "https://vergeml.com/tutorial"

_CACHE_HELP = """
Caching can help to speed up the training process. For example:

  data:
    cache: mem-out

mem:         Cache sample data in memory (default).
mem-out:     Cache data in memory after preprocessing.
disk:        Cache data on disk in a format optimized for fast access.
disk-out:    Cache data on disk after preprocessing.
none:        Don't cache.

You can configure the cache from your project file or on the command line via the --cache option.
"""

_OUTPUT_HELP = """
Output is an advanced option that can be set via the data.output option in the project file.
"""

_PREPROCESS_HELP = """
To change and augment your samples data during training, you can define a preprocessing pipeline. For example:

  data:
    preprocess:
       - op: augment
         variants: 4
       - op: random-crop
         width: 128
         height: 128
"""

_DATA_HELP = """
The data section in your config file lets you set up how data is loaded and processed. For example:

  data:
      input:
        type: images
        input-patterns: **/*.jpg
      preprocess:
        - op: center-crop
          width: 128
          height: 128

It is comprised of four subsections:

input:         Controls how the data is loaded.
preprocess:    Transform and augment sample data.
output:        Set the final transformation before training.
cache:         Use cache to speed up the training process.

To learn more, see 'ml help <subsection>', e.g. 'ml help preprocess'.
"""


_DEVICE_HELP = """
The device section in your config file lets you configure the device to use when training and predicting. It supports the following settings:

id:        The id of the device to use. (See below.)
memory:    How much device memory to use as a percentage. i.e. 50%
grow-memory:    When true, allow growing memory usage as needed.

The value of device.id can be either 'auto' (the default), 'cpu', 'gpu' or 'gpu:number', where number is the number of the GPU you want to use.

As a shortcut, you can set the device id directly, e.g.

  device: gpu

Device ID and memory usage can be set on the command line via --device and --device-memory flags.
"""

@command('help', descr="Get general help or specific help for a command.", free_form=True)
@option('<topic>', type=Optional[str], descr="The topic to get help on.")
@option('@AI', type='Optional[@]')
@option('all', type='Optional[bool]', short="a", flag=True, descr="Show all help topics.")
class HelpCommand(CommandPlugin):

    def __call__(self, args, env):
        _AI, topic = args
        topic = " ".join(topic)
        if topic == "tutorial":
            if webbrowser.open(_TUTORIAL_URL, new=2):
                print("Opened {} in a new browser tab.".format(_TUTORIAL_URL))
            else:
                print("Could not access the web browser. Please use this URL to access the tutorial:")
                print(_TUTORIAL_URL)
        else:
            print(self.get_help(env, topic))

    def get_help(self, env=None, topic="", short=False):

        if topic:
            model_commands = {}
            if env and env.model_plugin:
                for fn in Command.find_functions(env.model_plugin):
                    cmd = Command.discover(fn)
                    model_commands[cmd.name] = cmd

            if topic == "-a":
                return self.format_topics(env)
            # show VergeML options
            elif topic == "options":
                return self.format_options()

            # display the glossary
            elif topic == "glossary":
                return self.format_glossary()

            # show available models
            elif topic == "models":
                return _with_header(self.format_models(),
                                    help="models", topic=topic)

            # explain the data.input section
            elif topic == "input":
                return _with_header(self.format_input_list(),
                                    help="configuration", topic=topic)

            # explain the data.cache section
            elif topic == "cache":
                return _with_header(format_info_text(_CACHE_HELP),
                                    help="configuration", topic=topic)

            # explain the data.output section
            elif topic == "output":
                return _with_header(format_info_text(_OUTPUT_HELP),
                                    help="configuration", topic=topic)

            # explain preprocessing
            elif topic in ("preprocess", "preprocessing"):
                return _with_header(self.format_preprocessing_list(),
                                    help="configuration", topic=topic)

            # explain the data section
            elif topic == "data":
                return _with_header(format_info_text(_DATA_HELP.strip()),
                                    help="configuration", topic=topic)

            # explain the device section
            elif topic == "device":
                return _with_header(format_info_text(_DEVICE_HELP.strip()),
                                    help="configuration", topic=topic)

            # show a random robot
            elif topic == "random robot":
                robot = ascii_robot(datetime.datetime.now(),
                                    random_robot_name(datetime.datetime.now()))
                return f"\n{robot}\n"

            elif ":" in topic and topic.split(":", 1)[0] in self.plugins.keys('vergeml.cmd'):
                command, subcommand = topic.split(":")
                cmd = Command.discover(self.plugins.get('vergeml.cmd', command))
                subcommand_option = next(filter(lambda o: bool(o.subcommand), cmd.options), None)
                if not subcommand_option:
                    raise VergeMLError(f"{command} takes no subcommand", help_topic=command)

                plugin = self.plugins.get(subcommand_option.subcommand, subcommand)
                if not plugin:
                    raise VergeMLError(f"Invalid {subcommand_option.name}", help_topic=command)

                cmd = Command.discover(plugin)
                return cmd.usage(short, parent_command=command)

            # display model command help
            elif topic in model_commands:
                return model_commands[topic].usage(short)

            # display command help
            elif topic in self.plugins.keys('vergeml.cmd'):
                cmd = Command.discover(self.plugins.get('vergeml.cmd', topic))
                return cmd.usage(short)

            elif topic in self.plugins.keys('vergeml.operation'):
                return _with_header(self.format_source_or_operation(topic, 'vergeml.operation', Operation),
                                    help="preprocessing operation", topic=topic)

            elif topic in self.plugins.keys('vergeml.io'):
                return _with_header(self.format_source_or_operation(topic, 'vergeml.io', Source),
                                    help="data source", topic=topic)

            elif topic in self.plugins.keys('vergeml.model'):
                return _with_header(self.format_model(topic),
                                    help="models", topic=topic)

            # show a glossary entry
            elif glossary.long_descr(topic):
                topic = glossary.SYNONYMS.get(topic, topic)
                return _with_header(format_info_text(glossary.long_descr(topic)),
                                    help="glossary", topic=topic)

            # show base options help
            elif topic in dict(HELP_OPTIONS):
                return _with_header(format_info_text(dict(HELP_OPTIONS).get(topic)),
                                    help="base options", topic=topic)

            else:
                candidates = set()
                candidates.update(map(lambda h: h[0], _GENERAL_HELP))
                candidates.update(self.plugins.keys("vergeml.cmd"))
                candidates.update(map(lambda h: h[0], _CONFIGURATION_HELP))
                candidates.update(self.plugins.keys("vergeml.io"))
                candidates.update(self.plugins.keys("vergeml.operation"))
                candidates.update(self.plugins.keys("vergeml.model"))
                if env and env.model_plugin:
                    for fn in Command.find_functions(env.model_plugin):
                        cmd = Command.discover(fn)
                        candidates.add(cmd.name)
                candidates.update(glossary.LONG_DESCR.keys())
                candidates.update(glossary.SYNONYMS.keys())

                suggestion = did_you_mean(list(candidates), topic)
                if suggestion:
                    return f"No help found for topic '{topic}'. " + suggestion
                else:
                    return f"No help found for topic '{topic}'."

        else:
            return self.format_general_help(env, short=short)

    def format_topics(self, env):
        buffer = io.StringIO()

        print("General Help:", file=buffer)
        for topic, descr in _GENERAL_HELP:
            print("  {:<16} {}".format(topic, descr), file=buffer)
        print("", file=buffer)

        print("Commands:", file=buffer)
        for cmd_name in self.plugins.keys('vergeml.cmd'):
            descr = Command.discover(self.plugins.get('vergeml.cmd', cmd_name)).descr
            print("  {:<16} {}".format(cmd_name, descr), file=buffer)
        print("", file=buffer)

        if env and env.model_plugin:
            print("Model Commands:", file=buffer)
            for fn in Command.find_functions(env.model_plugin):
                cmd = Command.discover(fn)
                print("  {:<16} {}".format(cmd.name, cmd.descr), file=buffer)
            print("", file=buffer)

        print("Configuration:", file=buffer)
        for topic, descr in _CONFIGURATION_HELP:
            print("  {:<16} {}".format(topic, descr), file=buffer)
        print("", file=buffer)

        inputs = []
        for k in self.plugins.keys('vergeml.io'):
            plugin = self.plugins.get('vergeml.io', k)
            source = Source.discover(plugin)
            inputs.append((k, source.descr))

        print("Data Input:", file=buffer)
        print(_get_table(inputs, IND=2, colon=False), file=buffer)
        print("", file=buffer)

        ops = {}
        for k in self.plugins.keys('vergeml.operation'):
            plugin = self.plugins.get('vergeml.operation', k)
            op = Operation.discover(plugin)
            topic = op.topic or "general"
            descr = op.descr
            ops.setdefault(topic, [])
            ops[topic].append((k, descr))

        for k, v in sorted(ops.items()):
            topic = k.capitalize()
            print(f"{topic} Operations:", file=buffer)
            print(format_info_text(_get_table(v), indent=2), file=buffer)
            print("", file=buffer)

        models = []
        for name in self.plugins.keys("vergeml.model"):
            plugin = self.plugins.get('vergeml.model', name)
            model = Model.discover(plugin)
            models.append((name, model.descr))

        if models:
            print(_get_table(models), file=buffer)

        print ("Glossary:", file=buffer)
        items = ", ".join(glossary.LONG_DESCR.keys())
        print(format_info_text(items, indent=2), file=buffer)

        return buffer.getvalue().strip()

    def format_glossary(self):
        buffer = io.StringIO()
        for k, v in sorted(glossary.LONG_DESCR.items()):
            print(f"{k}:", file=buffer)
            print(format_info_text(v, indent=2), file=buffer)
            print("", file=buffer)
        return buffer.getvalue().strip()

    def format_models(self):
        buffer = io.StringIO()

        model_names = self.plugins.keys("vergeml.model")
        if not model_names:
            print("No models installed.", file=buffer)
            # LATER
            # print("No models installed. See 'ml help install'", file=buffer)
            return buffer.getvalue().strip()
        models = []
        for name in model_names:
            plugin = self.plugins.get('vergeml.model', name)
            model = Model.discover(plugin)
            models.append((name, model.descr))

        print(_get_table(models), file=buffer)

        n_models = len(models)
        label = 'model' if n_models == 1 else 'models'
        print("", file=buffer)
        print(f"{n_models} {label} installed.", file=buffer)
        # LATER
        #print(f"{n_models} {label} installed. To install more, see 'ml help install'", file=buffer)
        return buffer.getvalue().strip()

    def format_general_help(self, env=None, short=False):
        buffer = io.StringIO()
        print(USAGE, file=buffer)
        print("", file=buffer)

        terms = set(glossary.LONG_DESCR.keys())
        terms.update(self.plugins.keys('vergeml.cmd'))
        rng = random.Random()
        rng.seed(datetime.datetime.now())
        random_term = rng.choice(list(terms))

        if env and env.model_plugin:
            print(f"Current Model: {env.get('model')}", file=buffer)
            print("", file=buffer)

        print("General Help:", file=buffer)
        for topic, descr in _GENERAL_HELP:
            print("  {:<16} {}".format(topic, descr), file=buffer)
        print("", file=buffer)

        print("Commands:", file=buffer)
        for cmd_name in self.plugins.keys('vergeml.cmd'):
            descr = Command.discover(self.plugins.get('vergeml.cmd', cmd_name)).descr
            print("  {:<16} {}".format(cmd_name, descr), file=buffer)
        print("", file=buffer)

        if env and env.model_plugin:
            print("Model Commands:", file=buffer)
            for fn in Command.find_functions(env.model_plugin):
                cmd = Command.discover(fn)
                print("  {:<16} {}".format(cmd.name, cmd.descr), file=buffer)
            print("", file=buffer)

        if not short:
            print("See 'ml help <command>' or 'ml help <topic>' to read about a specific subcommand or topic.", file=buffer)
            print(f"For example, try 'ml help {random_term}'", file=buffer)

        return buffer.getvalue().strip()

    def format_options(self):
        buffer = io.StringIO()
        print(USAGE, file=buffer)
        print("", file=buffer)
        for k, v in HELP_OPTIONS:
            print("{:<18} {}".format(k, v), file=buffer)
        return buffer.getvalue().strip()

    def format_input_list(self):
        buffer = io.StringIO()
        print("Controls how your data is loaded. Possible values for data.input are:", file=buffer)
        print("", file=buffer)
        inputs = []
        for k in self.plugins.keys('vergeml.io'):
            plugin = self.plugins.get('vergeml.io', k)
            source = Source.discover(plugin)
            inputs.append((k, source.descr))

        print(_get_table(inputs), file=buffer)
        print("", file=buffer)
        print("For more help on a particular input, see 'ml help <input-name>.'", file=buffer)
        return buffer.getvalue().strip()

    def format_preprocessing_list(self):
        buffer = io.StringIO()

        cmd = Command.discover(PreprocessCommand)
        print(cmd.usage(), file=buffer)
        print("", file=buffer)
        print("Configuration:", file=buffer)

        print(format_info_text(_PREPROCESS_HELP.strip(), indent=2), file=buffer)
        print("", file=buffer)

        ops = {}
        for k in self.plugins.keys('vergeml.operation'):
            plugin = self.plugins.get('vergeml.operation', k)
            op = Operation.discover(plugin)
            topic = op.topic or "general"
            descr = op.descr
            ops.setdefault(topic, [])
            ops[topic].append((k, descr))

        for k, v in sorted(ops.items()):
            topic = k.capitalize()
            print(f"{topic} Operations:", file=buffer)
            print(format_info_text(_get_table(v), indent=2), file=buffer)
            print("", file=buffer)

        return buffer.getvalue().strip()

    def format_source_or_operation(self, name, group, what):
        op = what.discover(self.plugins.get(group, name))
        buffer = io.StringIO()
        descr = op.long_descr or op.descr
        if descr:
            print(descr, file=buffer)
        else:
            print(name, file=buffer)
        print("", file=buffer)
        options = op.options
        if options:
            print("Options:", file=buffer)
            for opt in options:
                print("", file=buffer)
                tp_descr = opt.human_type()
                if tp_descr:
                    print(f"{opt.name}: {tp_descr}", file=buffer)
                else:
                    print(f"{opt.name}", file=buffer)
                if opt.descr:
                    print(format_info_text(opt.descr, indent=2), file=buffer)
        return buffer.getvalue().strip()

    def format_model(self, name):
        plugin = self.plugins.get("vergeml.model", name)
        model = Model.discover(plugin)
        buffer = io.StringIO()
        if model.descr:
            print(format_info_text(model.descr), file=buffer)

        if model.long_descr:
            if model.descr:
                print("", file=buffer)
            print(format_info_text(model.long_descr), file=buffer)
        return buffer.getvalue()

def _get_table(table, SPACE=4, IND=0, colon=True):
    buffer = io.StringIO()
    max_name = max(map(lambda o: len(o[0]), table))
    for name, descr in sorted(table):
        if descr:
            nspace = (max_name + SPACE) - len(name)
            space = str(nspace * ' ')
            col = ":" if colon else ""
            ind = str(" "*IND)
            print(f"{ind}{name}{col}{space}{descr}", file=buffer)
        else:
            print(name, file=buffer)
    return buffer.getvalue().rstrip()

def _with_header(content, help, topic):
    buffer = io.StringIO()
    print(f"HELP:  *{help}*", file=buffer)
    print(f"TOPIC: {topic}", file=buffer)
    print("", file=buffer)
    print(content, file=buffer)
    return buffer.getvalue().strip()

from vergeml.commands.help import HelpCommand
from vergeml.plugins import _DictPluginManager
from vergeml.model import ModelPlugin, model
from vergeml.command import command, CommandPlugin
from vergeml.env import Environment

@command('test', descr='Test description.')
class CommandTest(CommandPlugin):

    def __call__(self):
        pass


GENERAL_HELP = """
Usage: ml [--version] [--file=<path>] [--model=<name>] [--samples-dir=<path>]
          [--val-split=<conf>] [--test-split=<conf>] [--cache-dir=<path>]
          [--trainings-dir=<path>] [--project-dir=<path>] [--random-seed=<value>]
          [--cache=<conf>] [--device=<id>] [--device-memory=<conf>]
          [@AI ...] <command> [<args> ...]

General Help:
  tutorial         Open the quickstart tutorial.
  options          List and describe VergeML options.
  glossary         Show a description of terms and concepts.
  models           List available VergeML models.

Commands:
  test             Test description.

See 'ml help <command>' or 'ml help <topic>' to read about a specific subcommand or topic.
For example, try""".strip()


def test_general_help():
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.cmd', 'test', CommandTest)
    env = Environment()
    help = HelpCommand('help', plugins=PLUGINS)
    assert GENERAL_HELP in help.format_general_help(env)


class ModelTest(ModelPlugin):
    @command('train', descr='Train the model.')
    def train(self, args, env):
        pass


GENERAL_HELP_MODEL = """
Usage: ml [--version] [--file=<path>] [--model=<name>] [--samples-dir=<path>]
          [--val-split=<conf>] [--test-split=<conf>] [--cache-dir=<path>]
          [--trainings-dir=<path>] [--project-dir=<path>] [--random-seed=<value>]
          [--cache=<conf>] [--device=<id>] [--device-memory=<conf>]
          [@AI ...] <command> [<args> ...]

Current Model: test

General Help:
  tutorial         Open the quickstart tutorial.
  options          List and describe VergeML options.
  glossary         Show a description of terms and concepts.
  models           List available VergeML models.

Commands:
  test             Test description.

Model Commands:
  train            Train the model.

See 'ml help <command>' or 'ml help <topic>' to read about a specific subcommand or topic.
For example, try""".strip()


def test_general_help_model():
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.cmd', 'test', CommandTest)
    PLUGINS.set('vergeml.model', 'test', ModelTest)
    env = Environment(model='test', plugins=PLUGINS)
    help = HelpCommand('help', plugins=PLUGINS)
    assert GENERAL_HELP_MODEL in help.format_general_help(env)

@model('imagenet', descr='Use a model pretrained on ImageNet to create classifiers via transfer learning.')
def ImageNetTestModel(ModelPlugin):
    pass

MODELS_HELP = """
imagenet:    Use a model pretrained on ImageNet to create classifiers via transfer learning.\n\n1 model installed.""".strip()

def test_help_models():
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.model', 'imagenet', ImageNetTestModel)
    help = HelpCommand('help', plugins=PLUGINS)
    assert help.format_models() == MODELS_HELP

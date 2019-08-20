"""Run command.
"""
from vergeml.command import command, CommandPlugin
from vergeml.option import option

# pylint: disable=R0903

@command('run', descr="Run a service or external program.")
@option('service', type=str, subcommand='vergeml.run')
class RunCommand(CommandPlugin):
    """Run a service or external program.
    """

    def __call__(self, args, env):
        plugin = self.plugins.get('vergeml.run', args['service'])(args['service'])
        plugin(args, env)

from vergeml.command import command, CommandPlugin
from vergeml.option import option

@command('plot', descr="Show different kinds of plots.")
@option('type', type=str, subcommand='vergeml.plot')
class PlotCommand(CommandPlugin):

    def __call__(self, args, env):
        plugin = self.plugins.get('vergeml.plot', args['type'])(args['type'])
        plugin(args, env)
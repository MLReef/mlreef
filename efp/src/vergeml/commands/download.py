from vergeml.command import command, CommandPlugin
from vergeml.plugins import PLUGINS
from vergeml.option import option
from vergeml.utils import VergeMLError
import shutil
import os.path
import zipfile
import tarfile


@command('download', descr="Download a dataset to the samples directory.")
@option('dataset', type=str, subcommand='vergeml.download')
class DownloadCommand(CommandPlugin):

    def __call__(self, args, env):
        samples_dir = env.get('samples-dir')
        if not os.path.exists(samples_dir):
            raise VergeMLError("samples dir does not exist: {}".format(samples_dir))

        plugin = self.plugins.get('vergeml.download', args['dataset'])()
        plugin(args, env)
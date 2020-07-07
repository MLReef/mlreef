from vergeml.command import command, CommandPlugin
from vergeml.option import option
from vergeml.utils import VergeMLError
import sys
import os.path

@command('new', descr="Create a new VergeML project.")
@option('<project-name>', type=str)
class NewCommand(CommandPlugin):

    def __call__(self, args, env):
        dest = args['<project-name>']
        if not env.model_plugin:
            template = "# model:\n#   name: <name of your model>\n"
        else:
            template = env.model_plugin.project_file_template()

        if not template.endswith("\n"):
            template = template + "\n"

        if os.path.exists(dest):
            raise VergeMLError("Directory already exists: {}".format(dest))

        os.makedirs(dest)
        os.makedirs(os.path.join(dest, "samples"))
        with open(os.path.join(dest, "vergeml.yaml"), "w") as f:
            f.write(template)
        print("Created new project: {}".format(dest))

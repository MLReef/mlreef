from vergeml.command import command, CommandPlugin
from vergeml.option import option
from vergeml.utils import VergeMLError
import os
import os.path
import subprocess
import re
import webbrowser

@command('tensorboard', descr="Run Tensorboard.")
@option('@AIs', type='List[@]', default=[])
@option('host', type='Optional[str]', descr="What host to listen to.")
@option('port', type=int, default=6006, descr="What port to serve Tensorboard on.")
class TensorboardService(CommandPlugin):

    def __call__(self, args, env):
        trainings_dir = env.get('trainings-dir')
        ais_with_tbstats = []

        if not os.path.exists(trainings_dir):
            raise VergeMLError("No trainings found.", "To run tensorboard, please train an AI first.")

        for dir in os.listdir(trainings_dir):
            if dir.startswith("."):
                continue
            stats_dir = os.path.join(trainings_dir, dir, "stats")

            if not os.path.exists(stats_dir):
                continue

            if not any(map(lambda d: d.startswith("events.out"), os.listdir(stats_dir))):
                continue

            ais_with_tbstats.append(dir)

        AIs = args["@AIs"] or ais_with_tbstats

        if not AIs:
            raise VergeMLError("No trainings found.", "To run tensorboard, please train an AI first.")

        for AI in AIs:
            if AI not in ais_with_tbstats:
                raise VergeMLError("Not tensorboard stats found for @{}".format(AI))

        dirs = []
        for AI in AIs:
            dirs.append(AI + ":" + os.path.join(trainings_dir, AI, "stats"))
        dirs = ",".join(dirs)
        cmd = ["tensorboard", "--logdir", dirs, "--port", str(args['port'])]
        if 'host' in args and args['host']:
            cmd.append('--host')
            cmd.append(args['host'])

        url = None

        try:
            for line in _run_command(cmd):
                line = line.decode('utf-8').rstrip()
                match = re.match(r".*?(http:[^ ]*)", line)
                if match:
                    url = match.group(1)
                    webbrowser.open(url)
                print(line)
        except FileNotFoundError:
            raise VergeMLError("Command 'tensorboard' not found.",
                               "Please install tensorboard (pip install tensorboard)")

def _run_command(command):
    p = subprocess.Popen(command,
                         stdout=subprocess.PIPE,
                         stderr=subprocess.STDOUT)
    return iter(p.stdout.readline, b'')
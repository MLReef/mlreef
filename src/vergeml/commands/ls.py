"""List command.
"""
from copy import deepcopy
from collections import OrderedDict
import os
import os.path
import json
import csv
from datetime import datetime
import io
import sys

import yaml

from vergeml.command import command, CommandPlugin, Command
from vergeml.option import option
from vergeml.utils import VergeMLError
from vergeml.display import DISPLAY
from vergeml.config import parse_command

EXAMPLES = """
$ ml list -sacc
# sort by acc value

$ ml list status -eq RUNNING
# show trainings that are currently running

$ ml list test_acc -gt 0.8
# show AIs with a test accuracy that is greater than 0.8

# available comparison operations:
# -gt, -lt, -eq, -neq, -gte and -lte
""".strip()

@command('list', descr="List trained models.", free_form=True, examples=EXAMPLES) # pylint: disable=R0903
@option('sort', descr="By which column to sort.", default='created-at', short='s')
@option('order', descr="Sort order.", default='asc', short='o', validate=('asc', 'desc'))
@option('columns', descr="Which columns to show.", type='Optional[Union[str, List[str]]]', short='c')
@option('output', descr="Output format.", default='table', validate=('table', 'csv', 'json'))
class ListCommand(CommandPlugin):
    """List trained models"""

    def __call__(self, args, env):

        # Parse and partition into normal and comparison args.
        args, cargs = _parse_args(args, env)

        # When trainings dir does not exist, print an error and exit
        if not os.path.exists(env.get('trainings-dir')):
            print("No trainings found.", file=sys.stderr)
            return

        info, hyper = _find_trained_models(args, env)

        theader, tdata, left_align = _format_table(args, cargs, info, hyper)

        _output_table(args['output'], theader, tdata, left_align)

def _parse_args(args, env):
    args = args[1]

    comps = []
    for idx, arg in enumerate(args):
        if arg in ('-gt', '-lt', '-eq', '-neq', '-gte', '-lte'):
            start, end = idx - 1, idx + 1
            if start < 0 or end >= len(args):
                raise VergeMLError("Invalid options.", help_topic='list')
            comps.append((start, end))

    cargs = []
    for start, end in reversed(comps):
        cargs.append(args[start:end+1])
        del args[start:end+1]

    cmd = deepcopy(Command.discover(ListCommand))
    cmd.free_form = False
    args.insert(0, 'list')
    args = cmd.parse(args)

    # If existent, read settings from the config file
    config = parse_command(cmd, env.get(cmd.name))

    # Set missing args from the config file
    for k, arg in config.items():
        args.setdefault(k, arg)

    # Set missing args from default
    for opt in cmd.options:
        if opt.name not in args and (opt.default is not None or not opt.is_required()):
            args[opt.name] = opt.default

    return args, cargs

def _find_trained_models(args, env):
    info = {}
    hyper = {}
    train_dir = env.get('trainings-dir')

    for trained_model in os.listdir(train_dir):
        data_yaml = os.path.join(train_dir, trained_model, 'data.yaml')
        if os.path.isfile(data_yaml):
            with open(data_yaml) as file:
                doc = yaml.safe_load(file)
        else:
            doc = {}
        info[trained_model] = {}
        hyper[trained_model] = {}

        if 'model' in doc:
            info[trained_model]['model'] = doc['model']

        if 'results' in doc:
            info[trained_model].update(doc['results'])

        if 'hyperparameters' in doc:
            hyper[trained_model].update(doc['hyperparameters'])

    sort = [s.strip() for s in args['sort'].split(",")]

    info = OrderedDict(sorted(info.items(), reverse=(args['order'] == 'asc'),
                              key=lambda x: [x[1].get(s, 0) for s in sort]))
    return info, hyper

def _format_table(args, cargs, info, hyper): # pylint: disable=R0912
    theader = ['AI', 'model', 'status', 'num-samples', 'training-start', 'epochs']
    exclude = ['training-end', 'steps', 'created-at']

    if args['columns']:
        cols = args['columns']
        if isinstance(cols, str):
            cols = cols.split(",")

        theader = ['AI'] + [s.strip() for s in cols]
        exclude = []

    tdata = []
    left_align = set([0])

    for trained_model, results in info.items():
        rdata = [""] * len(theader)
        rdata[0] = "@" + trained_model

        if not _filter(results, hyper[trained_model], cargs):
            continue

        for k, val in sorted(results.items()):
            if k in exclude and not args['columns']:
                continue

            if not k in theader and not args['columns'] and isinstance(val, (str, int, float)):
                theader.append(k)
                rdata.append(None)

            if k in theader:
                pos = theader.index(k)

                if k in ('training-start', 'training-end', 'created-at'):
                    val = datetime.utcfromtimestamp(val)
                    val = val.strftime("%Y-%m-%d %H:%M")
                elif isinstance(val, float):
                    val = "%.4f" % val
                elif isinstance(val, str):
                    left_align.add(pos)

                rdata[pos] = val

        for k, val in sorted(hyper[trained_model].items()):

            if k in theader:
                pos = theader.index(k)
                if isinstance(val, float):
                    val = "%.4f" % val
                elif isinstance(val, str):
                    left_align.add(pos)

                rdata[pos] = val

        tdata.append(rdata)

    return theader, tdata, left_align

def _output_table(output, theader, tdata, left_align):

    if not tdata:
        print("No matching trained models found.", file=sys.stderr)

    if output == 'table':
        if not tdata:
            return
        tdata.insert(0, theader)
        print(DISPLAY.table(tdata, left_align=left_align).getvalue(fit=True))

    elif output == 'json':
        res = []
        for row in tdata:
            res.append(dict(zip(theader, row)))
        print(json.dumps(res))

    elif output == 'csv':
        buffer = io.StringIO()

        writer = csv.writer(buffer)
        writer.writerow(theader)
        for row in tdata:
            writer.writerow(row)
        val = buffer.getvalue()
        val = val.replace('\r', '')
        print(val.strip())

def _filter(info, hyper, comp_args):
    try:
        cols = {}
        cols.update(hyper)
        cols.update(info)
        res = True
        for col, opr, val in comp_args:

            if not col in cols:
                return False

            cval = cols[col]

            if isinstance(cval, int):
                val = int(val)
            elif isinstance(cval, float):
                val = float(val)

            if opr == '-eq':
                res = res and (cval == val)
            elif opr == '-neq':
                res = res and (cval != val)
            elif opr == '-gt':
                res = res and (cval > val)
            elif opr == '-lt':
                res = res and (cval < val)
            elif opr == '-gte':
                res = res and (cval >= val)
            elif opr == '-lte':
                res = res and (cval <= val)

            if not res:
                return False
        return res
    except: # pylint: disable=W0702
        return False

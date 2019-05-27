"""Utility functions
"""
import inspect
import textwrap
from collections import namedtuple
import re
import os

SPLITS = ('train', 'val', 'test')


class VergeMLError(Exception):
    """System error.
    """

    def __init__(self, # pylint: disable=R0913
                 message, suggestion=None, help_topic=None, hint_type=None, hint_key=None):
        super().__init__(message)
        self.suggestion = suggestion
        self.message = message
        self.hint_type = hint_type
        self.hint_key = hint_key
        self.help_topic = help_topic

    def __str__(self):
        if self.suggestion:
            if len(self.message + self.suggestion) < 80:
                return self.message + " " + self.suggestion
            return self.message + "\n" + self.suggestion
        return self.message


def wrap_text(text):
    """Wrap text to be readable in the terminal.
    """
    # TODO check terminal width
    res = []
    for para in text.split("\n\n"):
        if para.splitlines()[0].strip().endswith(":"):
            res.append(para)
        else:
            res.append(textwrap.fill(para, drop_whitespace=True, fix_sentence_endings=True))
    return "\n\n".join(res)


_Intro = namedtuple('_Intro', ['args', 'defaults', 'types'])


def introspect(call):
    """Introspect a function call.
    """
    spec = inspect.getfullargspec(call)
    args = spec.args
    defaults = dict(zip(reversed(spec.args), reversed(spec.defaults or [])))
    types = spec.annotations
    return _Intro(args, defaults, types)


# taken from here: https://www.python-course.eu/levenshtein_distance.php
def _iterative_levenshtein(source, targ):
    """
        iterative_levenshtein(source, targ) -> ldist
        ldist is the Levenshtein distance between the strings
        source and targ.
        For all i and j, dist[i,j] will contain the Levenshtein
        distance between the first i characters of source and the
        first j characters of targ
    """
    rows = len(source)+1
    cols = len(targ)+1
    dist = [[0 for x in range(cols)] for x in range(rows)]
    # source prefixes can be transformed into empty strings
    # by deletions:
    for i in range(1, rows):
        dist[i][0] = i
    # target prefixes can be created from an empty source string
    # by inserting the characters
    for i in range(1, cols):
        dist[0][i] = i

    row, col = None, None

    for col in range(1, cols):
        for row in range(1, rows):
            if source[row-1] == targ[col-1]:
                cost = 0
            else:
                cost = 1
            dist[row][col] = min(dist[row-1][col] + 1,      # deletion
                                 dist[row][col-1] + 1,      # insertion
                                 dist[row-1][col-1] + cost) # substitution

    assert row and col
    return dist[row][col]


def did_you_mean(candidates, value, fmt="'{}'"):
    """In case of a misspelling, return possible candidates.
    """
    candidates = list(candidates)
    names = list(sorted(map(lambda n: (_iterative_levenshtein(value, n), n), candidates)))
    names = list(filter(lambda dn: dn[0] <= 2, names))
    return 'Did you mean ' + fmt.format(names[0][1]) + '?' if names else None


def dict_set_path(dic, path, value):
    """Set the value of a dict using path syntax.
    """
    cur = dic
    path = path.split(".")
    for key in path[:-1]:
        cur = cur.setdefault(key, {})
    cur[path[-1]] = value

def dict_del_path(dic, path):
    """Delete a value from a dict using path syntax.
    """
    if isinstance(path, str):
        path = path.split(".")
    if len(path) == 1:
        del[dic[path[0]]]
    else:
        pat, *rest = path
        dict_del_path(dic[pat], rest)
        if not dic[pat]:
            del dic[pat]

def dict_has_path(dic, path):
    """Check if a dict contains a value using path syntax.
    """
    cur = dic
    for pat in path.split("."):
        if isinstance(cur, dict) and pat in cur:
            cur = cur[pat]
        else:
            return False
    return True

_DEFAULT = object()
def dict_get_path(dic, path, default=_DEFAULT):
    """Get the value of a dict using path syntax.
    """
    cur = dic
    for pat in path.split("."):
        if isinstance(cur, dict) and pat in cur:
            cur = cur[pat]
        elif default != _DEFAULT:
            return default
        else:
            raise KeyError(path)
    return cur

def dict_merge(dict1, dict2):
    """Merge two dicts.
    """
    if not isinstance(dict1, dict) or not isinstance(dict2, dict):
        return dict2
    for k in dict2:
        if k in dict1:
            dict1[k] = dict_merge(dict1[k], dict2[k])
        else:
            dict1[k] = dict2[k]
    return dict1

def dict_paths(dic, path=None):
    """Get paths in a dict.
    """
    res = []
    if path:
        if not dict_has_path(dic, path):
            return res
        value = dict_get_path(dic, path)
    else:
        value = dic
    if not isinstance(dic, dict):
        return res
    def _collect_path(dic, path):
        for k, val in dic.items():
            npath = f"{path}.{k}" if path is not None else k
            if isinstance(val, dict):
                _collect_path(val, npath)
            else:
                res.append(npath)
    _collect_path(value, path)
    return res


def parse_trained_models(argv):
    """Parse @syntax for specifying trained models on the command line.
    """
    names = []
    for part in argv:
        if re.match("^@[a-zA-Z0-9_-]+$", part):
            names.append(part[1:])
        else:
            break
    rest = argv[len(names):]
    return names, rest

def parse_split(value):
    """Decodes the split value.

    Returns a tuple (type, value) where type is either perc, num or dir set.
    """
    assert isinstance(value, (int, str))

    if isinstance(value, int):
        return ('num', value)
    if value.endswith("%"):
        return ('perc', float(value.rstrip("%").strip()))
    if value.isdigit():
        return ('num', int(value))
    return ('dir', value)

def format_info_text(text, indent=0, width=70):
    """Return text formatted for readability.
    """
    text = text.strip("\n")
    res = []
    for line in text.splitlines():
        if line.startswith("  "):
            res.append(line)
        elif line.strip() == "":
            res.append(line)
        else:
            res.extend(textwrap.wrap(line, width=width-indent))
    if indent:
        indstr = str(' ' * indent)
        res = list(map(lambda l: indstr + l, res))
    return "\n".join(res)

if os.name == 'nt':
    def xlink(src, dst):
        """Cross platform file links.
        """
        os.link(src, dst)
else:
    def xlink(src, dst):
        """Cross platform file links.
        """
        # use symlink on Unix
        os.symlink(src, dst)

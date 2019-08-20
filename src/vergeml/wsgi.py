from vergeml.plugins import PLUGINS
from vergeml.utils import VergeMLError
import os.path
import io
from vergeml.command import Command
from collections import OrderedDict
from typing import Optional
import json
import cgi
import tempfile
import shutil
import re

class WSGIApp:

    def __init__(self, env):
        self.env = env
        self.fns = OrderedDict()
        for model_fn in Command.find_functions(env.model_plugin):
            cmd = Command.discover(model_fn)
            if cmd.type == 'predict':
                self.fns[cmd.name] = (cmd, model_fn)

        if not len(self.fns):
            raise VergeMLError(f"@{env.trained_model} can't be run as a REST service.")

    def handler(self, environ, start_response):
        path_info = environ.get('PATH_INFO')
        method = environ.get('REQUEST_METHOD')

        status = '404 NOT FOUND'
        response_body = 'Not Found.'.encode('utf-8')
        content_type = 'text/plain'

        if path_info.lstrip("/") in self.fns.keys():
            if method == "GET":
                status, response_body, content_type = self._serve_function(path_info.lstrip("/"), environ)
            elif method == "POST":
                status, response_body, content_type = self._predict(path_info.lstrip("/"), environ)
        elif path_info == '/css/rest.css':
            status, response_body, content_type = self._serve_file('text/css', 'css', 'rest.css')
        elif path_info == '/img/logo.png':
            status, response_body, content_type = self._serve_file('image/png', 'img', 'logo.png')
        elif path_info == '/img/logo-big.png':
            status, response_body, content_type = self._serve_file('image/png', 'img', 'logo-big.png')
        elif path_info == '/js/rest.js':
            status, response_body, content_type = self._serve_file('application/javascript', 'js', 'rest.js')
        elif path_info == '/':
            status, response_body, content_type = self._serve_index(environ)

        response_headers = [
            ('Content-Type', content_type),
        ]

        start_response(status, response_headers)

        return [response_body]

    def _serve_file(self, mime_type, *path):
        path = list(path)
        path.insert(0, 'other')
        path.insert(0, os.path.dirname(__file__))

        with open(os.path.join(*path), 'rb') as f:
            return '200 OK', f.read(), mime_type

    def _serve_index(self, environ):
        index = _TEMPLATE.format(name=self.env.trained_model,
                                 content='<a id="hamburger">&#9776;</a> <div id="logo-big"> </div>',
                                 menu=self._make_menu())
        return '200 OK', index.encode('utf-8'), 'text/html'

    def _serve_function(self, name, environ):
        host = "http://" + environ.get('SERVER_NAME') + ":" + str(environ.get('SERVER_PORT'))
        content_a = _TEMPLATE_A.format(host=host,
                                        name=name,
                                        descr=self.fns[name][0].descr,
                                        fields=self._make_fields(name))
        index = _TEMPLATE.format(name=self.env.trained_model,
                                 content=content_a + _TEMPLATE_B,
                                 menu=self._make_menu(name))
        return '200 OK', index.encode('utf-8'), 'text/html'

    def _make_menu(self, active=None):
        res = []
        for k in self.fns.keys():
            klass = 'active' if k == active else ''
            res.append(f'<a class="{klass}" href="/{k}">/{k}</a>')

        return "\n".join(res)

    def _make_fields(self, name):
        cmd = self.fns[name][0]


        res = []
        for o in cmd.options:
            if o.is_at_option() or o.command_line:
                continue

            display_name = o.name.strip("<").strip(">")
            descr = o.descr + " (" + o.human_type() + ")"

            if o.has_type(float, int, 'Optional[float]', 'Optional[int]'):
                value = '' if o.default is None else o.default
                res.append(_TEMPLATE_NUMBER.format(name=display_name, value=value, descr=descr))
            elif o.has_type('File', 'Optional[File]'):
                res.append(_TEMPLATE_FILE.format(name=display_name, multiple="", descr=descr, label='Select file...'))
            elif o.has_type('List[File]'):
                res.append(_TEMPLATE_FILE.format(name=display_name, multiple="multiple", descr=descr, label='Select files...'))
            elif o.has_type(str) and isinstance(o.validate, (list, tuple)):
                res.append(_TEMPLATE_LIST(name=display_name, descr=descr, opts=o.validate, default=o.default))
            else:
                value = '' if o.default is None else o.default
                res.append(_TEMPLATE_STRING.format(name=display_name, value=value, descr=descr))
        return "\n".join(res)

    def _predict(self, name, environ):
        if not is_post_request(environ):
            return '400 BAD REQUEST', b'Bad Request', 'text/plain'

        cmd, fn = self.fns[name]
        form = get_post_form(environ)

        args = {}
        tempdirs = []
        try:
            for o in cmd.options:

                if o.is_at_option():
                    args[o.name] = self.env.trained_model
                    continue

                if o.command_line:
                    args[o.name] = o.default
                    continue

                form_name = o.name.lstrip("<").rstrip(">")

                if form_name in form:
                    value = form[form_name]

                    if o.has_type("File", "List[File]", "Optional[File]"):
                        files = []
                        if not isinstance(value, list):
                            value = [value]
                        for item in value:
                            if not item.filename or not item.file:
                                continue
                            name = secure_filename(item.filename)
                            dir = tempfile.mkdtemp()
                            tempdirs.append(dir)
                            name = os.path.join(dir, name)
                            with open(name, 'wb') as f:
                                shutil.copyfileobj(item.file, f)
                            files.append(name)

                        if o.has_type("File"):
                            if not files:
                                raise VergeMLError("Missing argument: {}".format(o.name))
                            args[o.name] = files[0]
                        elif o.has_type("Optional[File]"):
                            if files:
                                args[o.name] = files[0]
                        else:
                            args[o.name] = files
                    else:
                        args[o.name] = value.value

                    if o.name in args:
                        value = args[o.name]
                        value = o.cast_value(value)
                        value = o.transform_value(value)
                        o.validate_value(value)
                        args[o.name] = value
                else:
                    if not o.is_optional():
                        raise VergeMLError("Missing argument: {}".format(o.name))
                    elif o.default:
                        args[o.name] = o.default
        except VergeMLError as e:
            for d in tempdirs:
                shutil.rmtree(d)
            return '400 BAD REQUEST', e.message.encode('utf-8'), 'text/plain'

        try:
            res = fn(args, self.env)
        finally:
            for d in tempdirs:
                shutil.rmtree(d)

        return '200 OK', json.dumps(res).encode('utf-8'), 'application/json'

# https://wsgi.readthedocs.io/en/latest/specifications/handling_post_forms.html
def is_post_request(environ):
    if environ['REQUEST_METHOD'].upper() != 'POST':
        return False
    content_type = environ.get('CONTENT_TYPE', 'application/x-www-form-urlencoded')
    return (content_type.startswith('application/x-www-form-urlencoded')
        or content_type.startswith('multipart/form-data'))

def get_post_form(environ):
    assert is_post_request(environ)
    input = environ['wsgi.input']
    post_form = environ.get('wsgi.post_form')
    if (post_form is not None
        and post_form[0] is input):
        return post_form[2]
    # This must be done to avoid a bug in cgi.FieldStorage
    environ.setdefault('QUERY_STRING', '')
    fs = cgi.FieldStorage(fp=input,
                          environ=environ,
                          keep_blank_values=1)

    return fs

# from https://github.com/pallets/werkzeug/blob/master/werkzeug/utils.py
_filename_ascii_strip_re = re.compile(r'[^A-Za-z0-9_.-]')
_windows_device_files = ('CON', 'AUX', 'COM1', 'COM2', 'COM3', 'COM4', 'LPT1',
                         'LPT2', 'LPT3', 'PRN', 'NUL')
def secure_filename(filename):
    if isinstance(filename, str):
        from unicodedata import normalize
        filename = normalize('NFKD', filename).encode('ascii', 'ignore')
        filename = filename.decode('ascii')
    for sep in os.path.sep, os.path.altsep:
        if sep:
            filename = filename.replace(sep, ' ')
    filename = str(_filename_ascii_strip_re.sub('', '_'.join(
                   filename.split()))).strip('._')

    # on nt a couple of special files are present in each folder.  We
    # have to ensure that the target file is not such a filename.  In
    # this case we prepend an underline
    if os.name == 'nt' and filename and \
       filename.split('.')[0].upper() in _windows_device_files:
        filename = '_' + filename

    return filename

_TEMPLATE = """

<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" type="text/css" href="css/rest.css">

</head>
<body>
    <div id="overlay"></div>
    <div class="container">
        <div class="sidebar">
            <a href="/"><img src="img/logo.png" id="logo">@{name}</a>
            {menu}
        </div>
        <div class="content">
            {content}
        </div>
    </div>
</body>
<script src="js/rest.js"></script>
</html>

"""

_TEMPLATE_A = """
<div class="column" id="A">
    <div class="header">
        <a id="hamburger">&#9776;</a>
        <a class="method">POST</a>
        <span class="url"><span class="host">{host}</span>/{name}</span>
    </div>
    <div class="body">
        <form id="main-form" action="{name}" method="POST" enctype="multipart/form-data">
            <h2>{descr}</h2>

            {fields}

            <div class="submit">
                <input id="submit-button" type="submit" value="SEND">
            </div>
        </form>
    </div>
</div>
"""

_TEMPLATE_B = """
<div class="column" id="B">
    <div class="header">
        <span id="time" class="dark-box">
            TIME xxxms
        </span>
        <span id="status-ok" class="green-box">
            STATUS OK
        </span>
        <span id="status-err" class="red-box">
            STATUS ERROR
        </span>
    </div>
    <div class="body">
        <div class="json">
        </div>
    </div>
</div>
"""

_TEMPLATE_NUMBER = """
<div class="row">
    <div class="input">
        <span class="field">{name}</span>
        <input type="number" name="{name}" value="{value}">
    </div>
    <div class="description">{descr}</div>
</div>
"""


_TEMPLATE_STRING = """
<div class="row">
    <div class="input">
        <span class="field">{name}</span>
        <input type="text" name="{name}" value="{value}">
    </div>
    <div class="description">{descr}</div>
</div>
"""

_TEMPLATE_FILE = """
<div class="row">
    <div class="input">
        <span class="field">{name}</span>
        <input name="{name}" id="__{name}_input__" type="file" onchange="updateFileInput('{name}')" {multiple}>
        <label id="__{name}_label__" for="__{name}_input__">{label}</label>
    </div>
    <div class="description">{descr}</div>
</div>
"""

def _TEMPLATE_LIST(name, descr, opts, default):
    def _fopt(opt):
        sel = 'selected="selected"' if opt == default else ''
        return f'<option value="{opt}" {sel}>{opt}</option>'

    options = "\n".join(map(_fopt, opts))

    return """
    <div class="row">
        <div class="input">
            <span class="field">{name}</span>
            <select name="{name}">
                {options}
            </select>
        </div>
        <div class="description">{descr}</div>
    </div>
    """.format(name=name, descr=descr, options=options)
from vergeml.command import command, CommandPlugin
from vergeml.option import option
from vergeml.utils import VergeMLError
import os
import os.path
import importlib
from vergeml.wsgi import WSGIApp
import sys
import webbrowser
import queue
from vergeml.display import DISPLAY

# Don't output text
DISPLAY.quiet = True

@command('rest', descr="Start a REST Server.")
@option('@AI')
@option('host', type=str, default='0.0.0.0', descr="Which host to listen on.")
@option('port', type=int, default=2204, descr="Which port to use.")
@option('no-browser', type=bool, default=False, descr="Don't open the browser.", flag=True)

class RestService(CommandPlugin):

    def __call__(self, args, env):
        if not bool(importlib.util.find_spec('waitress')):
            raise VergeMLError("Package waitress is not installed.",
                               "To run a REST server, please install waitress first.")

        from waitress.server import create_server
        print("Loading @{} ...".format(args['@AI']))

        assert env.model_plugin
        wsgiapp =  WSGIApp(env)
        server = create_server(wsgiapp.handler, host=args['host'], port=args['port'], threads=1)
        q = queue.Queue()

        class LoadAIOnHandlerThread:

            def service(self):
                try:
                    env.model_plugin.load(env)
                    q.put("DONE")
                except Exception as e:
                    q.put(e)

            def defer(self):
                pass

            def cancel(self):
                pass

        server.task_dispatcher.add_task(LoadAIOnHandlerThread())
        res = q.get()
        if isinstance(res, Exception):
            raise res
        else:
            assert res == "DONE"

        url = "http://{}:{}".format(server.effective_host, server.effective_port)

        print("Serving on " + url)
        if not args['no-browser']:
            webbrowser.open(url)

        server.run()
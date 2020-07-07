import os.path
import json
import time
import datetime

_SYNC_INTV = 1.0 # sync interval in seconds

class Results:
    data = None
    path = None
    last_sync = datetime.datetime.fromtimestamp(time.mktime(time.gmtime(0))) # beginning of unix epoch

    def __init__(self, path):
        self.data = {}
        self.path = path
        if os.path.exists(path):
            with open(path) as f:
                self.data = json.load(f)
    
    def add(self, data_):
        self.data.update(data_)
        self._sync()
        
    def flush(self):
        self._sync(force=True)
    
    def _sync(self, force=False):
        now = datetime.datetime.now()
        if force or (now - self.last_sync).total_seconds() > _SYNC_INTV:
            self.last_sync = now
            with open(self.path, "w") as f:
                json.dump(self.data, f)
    
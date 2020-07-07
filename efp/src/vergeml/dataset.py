from vergeml.plugins import PLUGINS
from vergeml.option import Option
from vergeml.command import command
from vergeml.utils import VergeMLError
from vergeml.display import DISPLAY
import urllib
import urllib.request
import os
import tempfile
import uuid
import time

def dataset(name, descr=None, long_descr=None):
    """Define a dataset.

    :param name:        Name of the dataset.
    :param descr:       A short description of the dataset
    :param long_descr:  A long description
    """
    return command(name=name, descr=descr, long_descr=long_descr)

class DatasetPlugin:
    def __init__(self):
        self.progress_bar = None
        self.progress = None
        self.start_time = None
    
    def __call__(self, args, env):
        raise NotImplementedError
    
    def download_files(self, urls, env, headers=None, dir=None):

        if dir is None:
            dir = env.get('cache-dir')
        
        dest_directory = os.path.join(dir, "tmp_" + str(uuid.uuid4()))
        
        if not os.path.exists(dest_directory):
            os.makedirs(dest_directory)

        for data_url in urls:
            if isinstance(data_url, tuple):
                data_url, download_file = data_url
            else:
                download_file = data_url.split('/')[-1]

            download_path = os.path.join(dest_directory, download_file)

            if headers:
                opener = urllib.request.build_opener()
                opener.addheaders = headers
                urllib.request.install_opener(opener)

            try:
                urllib.request.urlretrieve(data_url, filename=download_path, 
                                           reporthook=self._report_hook(download_file), data=None)
            except Exception as e:
                raise VergeMLError("Could not download {}: {}".format(data_url, e))
            finally:
                if headers:
                    urllib.request.install_opener(urllib.request.build_opener())

        return dest_directory

    def _report_hook(self, filename):   
        def _update_to(count, block_size, total_size):
            self.progress = (count, block_size, total_size)

            if total_size:
                if not self.progress_bar:
                    self.progress_bar = DISPLAY.progressbar(steps=total_size, title=filename, post=self._post)
                    self.progress_bar.start()
                
                self.progress_bar.update(count*block_size)
                if count * block_size +1 >= total_size:
                    self.progress_bar.stop()
                    self.progress_bar = None
        return _update_to
    
    def _post(self):
        count, block_size, total_size = self.progress
        if total_size:
            if count == 0:
                self.start_time = time.time()
                return ""
            
            duration = time.time() - self.start_time
            progress_size = int(count * block_size)
            if duration != 0.0:
                speed = int(progress_size / (1024 * duration))
                return " %d MB, %d KB/s" % ( progress_size / (1024 * 1024), speed)
            else:
                return ""
        else:
            return ""
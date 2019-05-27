from pkg_resources import iter_entry_points, EntryPoint
from vergeml.utils import VergeMLError
import re

class _PluginManager:

    def get(self, group, name):
        raise NotImplementedError
    
    def set(self, group, name, plugin):
        raise NotImplementedError
    
    def keys(self, group):
        raise NotImplementedError
    
    def all(self, group):
        return {k:self.get(group, k) for k in self.keys(group)}

class _SetupToolsPluginManager(_PluginManager):

    def __init__(self):
        self.__plugins = {}

    def get(self, group, name):
        self.__plugins.setdefault(group, {})
        if name not in self.__plugins[group]:
            ep = next(iter_entry_points(group, name=name), None)
            if ep:
                self.__plugins[group][name] = ep.resolve()
        return self.__plugins[group].get(name, None)

    
    def set(self, group, name, plugin):
        self.__plugins.setdefault(group, {})
        self.__plugins[group][name] = plugin

    
    def keys(self, group):
        self.__plugins.setdefault(group, {})
        entry_points = list(iter_entry_points(group, name=None))
        ep_keys = set(map(lambda ep: ep.name, entry_points))
        return set(self.__plugins[group].keys()).union(ep_keys)
    
class _DictPluginManager(_PluginManager):

    def __init__(self):
        self.__plugins = {}

    def get(self, group, name):
        self.__plugins.setdefault(group, {})
        return self.__plugins[group].get(name, None)
    
    def set(self, group, name, plugin):
        self.__plugins.setdefault(group, {})
        self.__plugins[group][name] = plugin

    def keys(self, group):
        self.__plugins.setdefault(group, {})
        return set(self.__plugins[group].keys()) 


PLUGINS = _SetupToolsPluginManager()




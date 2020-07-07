"""Test Utitlity function
"""
from vergeml.utils import dict_set_path, dict_get_path, dict_del_path, dict_has_path
from vergeml.utils import dict_merge, dict_paths, parse_trained_models

# pylint: disable=C0111

def test_set_path():
    dic = {}
    dict_set_path(dic, "x.y.z", 1)
    assert dic == {'x': {'y': {'z': 1}}}

def test_set_path_existing():
    dic = {'x': {'y1': 1}}
    dict_set_path(dic, "x.y.z", 1)
    assert dic == {'x': {'y': {'z': 1}, 'y1': 1}}

def test_del_path():
    dic = {'x': {'y': {'z': 1}}}
    dict_del_path(dic, "x.y.z")
    assert dic == {}

def test_del_path_non_empty():
    dic = {'x': {'y': {'z': 1}, 'y1': 1}}
    dict_del_path(dic, "x.y.z")
    assert dic == {'x': {'y1': 1}}

def test_get_path():
    dic = {'x': {'y': {'z': 1}}}
    assert dict_get_path(dic, 'x.y.z') == 1

def test_get_path_top():
    dic = {'x': {'y': {'z': 1}}}
    assert dict_get_path(dic, 'x') == {'y': {'z': 1}}

def test_has_path():
    dic = {'x': {'y': {'z': 1}}}
    assert dict_has_path(dic, 'x.y.z')

def test_has_path_top():
    dic = {'x': {'y': {'z': 1}}}
    assert dict_has_path(dic, 'x')

def test_has_path_false():
    dic = {'x': {'y': {'z': 1}}}
    assert not dict_has_path(dic, 'x.z.y')

def test_merge():
    dic1 = {'device': {'id': 'gpu'}, 'something': 1}
    dic2 = {'device': {'memory': '20%'}, 'else': 2}
    assert dict_merge(dic1, dic2) == {'device': {'id': 'gpu', 'memory': '20%'},
                                      'something': 1, 'else': 2}

def test_paths():
    dic = {'x': {'y': {'z': 1}},
           'a': {'b': {'c1': 1, 'd1': 2}}}
    assert dict_paths(dic) == ['x.y.z', 'a.b.c1', 'a.b.d1']

def test_paths2():
    dic = {'x': {'y': {'z': 1}},
           'a': {'b': {'c1': 1, 'd1': 2}}}
    assert dict_paths(dic, 'a') == ['a.b.c1', 'a.b.d1']


def test_parse_trained_model():
    assert parse_trained_models(["@touchy-automaton", "train"]) == (["touchy-automaton"], ["train"])
    assert parse_trained_models(["@touchy-automaton", "@evil-skynet", "run", "tensorboard"]) == \
                         (["touchy-automaton", "evil-skynet"], ["run", "tensorboard"])
    assert parse_trained_models(["train", "--epochs=20"]) == \
                         ([], ["train", "--epochs=20"])

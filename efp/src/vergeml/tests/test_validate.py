"""
Test validation of environment configuration.
"""

import pytest

from vergeml import VergeMLError
from vergeml.plugins import _DictPluginManager
from vergeml.sources.image import ImageSource
from vergeml.operations.augment import AugmentOperation
from vergeml.config import parse_device, parse_data, yaml_find_definition, _display_err

# pylint: disable=C0111

def test_apply_empty_config():
    assert parse_device(None) == {
        'id': 'auto',
        'memory': 'auto',
        'grow-memory': True
    }


def test_apply_config():
    assert parse_device('gpu:1') == {
        'id': 'gpu:1',
        'memory': 'auto',
        'grow-memory': True
    }

def test_input_shortcut_1():
    plugins = _DictPluginManager()
    plugins.set('vergeml.io', 'image', ImageSource)
    assert parse_data('image') == {
        'input': {
            'type': 'image',
            'input-patterns': ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.bmp']},
        'cache': 'auto',
        'preprocess': []
    }

def test_input_shortcut_2():
    plugins = _DictPluginManager()
    plugins.set('vergeml.io', 'image', ImageSource)
    assert parse_data({'input': 'image'}) == {
        'input': {
            'type': 'image',
            'input-patterns': ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.bmp']},
        'cache': 'auto',
        'preprocess': []
    }

def test_input_output():
    plugins = _DictPluginManager()
    plugins.set('vergeml.io', 'image', ImageSource)
    assert parse_data({'input': {'type': 'image'}, 'output': {'type': 'image'}}) == {
        'input': {
            'type': 'image',
            'input-patterns': ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.bmp']},
        'output': {
            'type': 'image',
            'input-patterns': ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.bmp']},
        'cache': 'auto',
        'preprocess': []
    }

def test_validate_preprocess():
    plugins = _DictPluginManager()
    plugins.set('vergeml.operation', 'augment', AugmentOperation)
    assert parse_data({'preprocess': [{'op': 'augment', 'variants': 4}]}) == {
        'cache': 'auto',
        'preprocess': [{'op': 'augment', 'variants': 4}]
    }


def test_validate_preprocess_invalid():
    plugins = _DictPluginManager()
    plugins.set('vergeml.operation', 'augment', AugmentOperation)
    with pytest.raises(VergeMLError, match=r".*Did you mean 'variants'.*"):
        assert parse_data({'preprocess': [{'op': 'augment', 'variantz': 4}]})


def test_config_dict():
    assert parse_device({'id': 'gpu:1'}) == {
        'id': 'gpu:1',
        'memory': 'auto',
        'grow-memory': True
    }

def test_config_invalid():
    with pytest.raises(VergeMLError):
        assert parse_device({'id': 'gpu:1', 'invalid': 'true'}) == {
            'id': 'gpu:1',
            'memory': 'auto',
            'grow-memory': True
        }


TEST_YAML = """\
data:
    input:
        type: imagez

    preprocess:
        - op: center-crop
          width: 30
          height: 30

        - op: flip-horizontalz

        - op: rgb
"""


def test_find_definition_key():
    res = yaml_find_definition(TEST_YAML, 'data.input.type', 'key')
    assert res == (2, 8, 5)


def test_find_definition_val():
    res = yaml_find_definition(TEST_YAML, 'data.input.type', 'value')
    assert res == (2, 14, 6)


def test_find_definition_arr_key():
    res = yaml_find_definition(TEST_YAML, 'data.preprocess.1.op', 'key')
    assert res == (9, 10, 3)


def test_find_definition_arr_val():
    res = yaml_find_definition(TEST_YAML, 'data.preprocess.1.op', 'value')
    assert res == (9, 14, 16)


def test_display_err():
    line, column, length = yaml_find_definition(TEST_YAML, 'data.preprocess.1.op', 'value')
    msg = "Invalid preprocessing operation 'flip-horizontalz'. Did you mean 'flip-horizontal'?"
    res = _display_err("vergeml.yaml", line, column, msg, length, 3, TEST_YAML)
    res = "Error! " + res

    assert res == """\
Error! File vergeml.yaml, line 10:15
------------------------------------
          height: 30

        - op: flip-horizontalz
              ^^^^^^^^^^^^^^^^
Invalid preprocessing operation 'flip-horizontalz'. Did you mean 'flip-horizontal'?"""


def test_apply_config_image():
    plugins = _DictPluginManager()
    plugins.set('vergeml.io', 'image', ImageSource)
    assert parse_data({'input': {'type': 'image', 'input-patterns': '*.jpg'}}) == {
        'input': {
            'type': 'image',
            'input-patterns': ['*.jpg']
        },
        'cache': 'auto',
        'preprocess': []
    }


def test_apply_config_image_invalid():
    plugins = _DictPluginManager()
    plugins.set('vergeml.io', 'image', ImageSource)
    with pytest.raises(VergeMLError):
        parse_data({'input': {'type': 'image', 'input-patternz': '*.jpg'}})

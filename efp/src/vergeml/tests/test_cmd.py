import pytest
from vergeml.__main__ import _parsebase, _env_from_args, _prepare_args, run, main
from vergeml.plugins import _DictPluginManager
from vergeml.utils import VergeMLError
from vergeml.command import command, CommandPlugin
from vergeml.option import option
import getopt
import os.path

def test_parse_base_version():
    args, _ = _parsebase(['-v'])
    assert 'version' in args

    args, _ = _parsebase(['--version'])
    assert 'version' in args

def test_parse_short_args():
    args, rest = _parsebase(['-m', 'inception-v3', '--random-seed=42', 'train'])
    assert args == {'model': 'inception-v3', 'random-seed': '42'}
    assert rest == ['train']

def test_invalid_opt():
    with pytest.raises(getopt.GetoptError):
        _parsebase(['--invalid', 'opt'])
    with pytest.raises(getopt.GetoptError):
        _parsebase(['--test=10%'])

def test_config_plugin():
    args, _ = _parsebase(['--device=gpu', '--device-memory=20%'])
    assert(args == {'device': 'gpu', 'device-memory': '20%'})
    with pytest.raises(getopt.GetoptError):
        _parsebase(['--device-id=gpu', '--device-memory=20%'])

def test_random_seed():
    args = _prepare_args({'random-seed': '1234'})
    assert args['random-seed'] == 1234

    with pytest.raises(VergeMLError):
        _prepare_args({'random-seed': 'xyz'})

def test_env_from_args():
    default_env = _env_from_args({}, {}, None)
    assert default_env
    assert default_env.get('samples-dir') == 'samples'
    assert default_env.get('test-split') == '10%'
    assert default_env.get('val-split') == '10%'
    assert default_env.get('cache-dir') == '.cache'
    assert default_env.get('random-seed') == 42
    assert default_env.get('trainings-dir') == 'trainings'

def test_env_from_project_file(tmpdir):
    d1 = tmpdir.mkdir("p1")
    p1 = d1.join("vergeml.yaml")
    p1.write("random-seed: 22041980")
    env = _env_from_args({'project-file': str(p1)}, {}, None)
    assert env.get('random-seed') == 22041980

def test_cmdline_overrides_project_file(tmpdir):
    d1 = tmpdir.mkdir("p1")
    p1 = d1.join("vergeml.yaml")
    p1.write("random-seed: 1234")
    env = _env_from_args({'project-file': str(p1), 'random-seed': 456}, {}, None)
    assert env.get('random-seed') == 456

def test_env_from_project_file_invalid(tmpdir):
    d1 = tmpdir.mkdir("p1")
    p1 = d1.join("vergeml.yaml")
    p1.write("random-seed = 22041980")
    with pytest.raises(VergeMLError):
        _env_from_args({'project-file': str(p1)}, {}, None)

def test_env_from_project_file_invalid_config(tmpdir):
    d1 = tmpdir.mkdir("p1")
    p1 = d1.join("vergeml.yaml")
    p1.write("data:\n  inputz: images")
    with pytest.raises(VergeMLError, match=r".*Invalid option 'data.inputz'. Did you mean 'input'.*"):
        _env_from_args({'project-file': str(p1)}, {}, None)

def test_run_command_options():
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.cmd', 'test', CommandTest)
    assert run(["test", "--learning-rate=0.1"], plugins=PLUGINS) == {'learning-rate': 0.1}

def test_run_command():
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.cmd', 'test', CommandTest)
    assert run(["test"], plugins=PLUGINS) == {'learning-rate': 0.001}

def test_run_command_options_invalid():
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.cmd', 'test', CommandTest)
    with pytest.raises(VergeMLError):
        run(["test", "--learniing-rate=0.1"], plugins=PLUGINS)

def test_run_command_base_options():
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.cmd', 'test', CommandTest)
    assert run(["--test-split=20%", "test"], plugins=PLUGINS) == {'learning-rate': 0.001}


def test_run_command_with_project_file(tmpdir):
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.cmd', 'train', CommandTest2)
    d1 = tmpdir.mkdir("p1")
    p1 = d1.join("vergeml.yaml")
    p1.write("train:\n  learning-rate: 0.002")
    assert run(["-f"+str(p1), "train"], plugins=PLUGINS) == {'learning-rate': 0.002}
    with pytest.raises(VergeMLError):
        run(["train"], plugins=PLUGINS)

def test_command_line_overrides_project_file_option(tmpdir):
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.cmd', 'train', CommandTest2)
    d1 = tmpdir.mkdir("p1")
    p1 = d1.join("vergeml.yaml")
    p1.write("train:\n  learning-rate: 0.002")
    assert run(["-f"+str(p1), "train", "--learning-rate=0.1"], plugins=PLUGINS) == {'learning-rate': 0.1}

def test_project_file_wrong_key(tmpdir):
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.cmd', 'train', CommandTest2)
    d1 = tmpdir.mkdir("p1")
    p1 = d1.join("vergeml.yaml")
    p1.write("train:\n  learning-rates: 0.002")
    with pytest.raises(VergeMLError, match="Invalid option 'train.learning-rates'. Did you mean 'learning-rate'"):
        run(["-f"+str(p1), "train", "--learning-rate=0.1"], plugins=PLUGINS)

def test_command_line_overrides_project_file_option_device(tmpdir):
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.cmd', 'train', CommandTest2)
    d1 = tmpdir.mkdir("p1")
    p1 = d1.join("vergeml.yaml")
    p1.write("device:\n  id: gpu")
    run(["-f"+str(p1), "--device=cpu", "train", "--learning-rate=0.1"], plugins=PLUGINS)
    from vergeml.env import ENV
    assert ENV.get('device.id') == 'cpu'

def test_run_command_free_form():
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.cmd', 'help', CommandTest3)
    assert run(["help"], plugins=PLUGINS) == (None, [])
    assert run(["help", '--y', '--x=y', 'something'], plugins=PLUGINS) == \
        (None, ['--y', '--x=y', 'something'])

def test_run_invalid_base_option():
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.cmd', 'help', CommandTest3)
    with pytest.raises(VergeMLError, match=r"Invalid option --test"):
        run(["--test=20%", "help"], plugins=PLUGINS)

def test_run_invalid_data_config(tmpdir):
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.cmd', 'train', CommandTest2)
    d1 = tmpdir.mkdir("p1")
    p1 = d1.join("vergeml.yaml")
    p1.write("data:\n  input:\n    type: images")
    with pytest.raises(VergeMLError, match=r".*line 3:11.*"):
        run(["-f"+str(p1), "train", "--learning-rate=0.0001"], plugins=PLUGINS)

def test_invalid_config_output(tmpdir, capsys):
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.cmd', 'help', CommandTest3)
    d1 = tmpdir.mkdir("p1")
    p1 = d1.join("vergeml.yaml")
    p1.write("data:\n  inputz: images")
    main(["-f"+str(p1), "help"], plugins=PLUGINS)
    err = capsys.readouterr().err

    assert "Did you mean 'input'" in err
    assert "See 'ml help data'" in err

def test_command_line_overrides_project_file_option_trainings_dir(tmpdir):
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.cmd', 'train', CommandTest2)
    d1 = tmpdir.mkdir("p1")
    p1 = d1.join("vergeml.yaml")
    p1.write("trainings-dir: /some/where")
    run(["-f"+str(p1), "--trainings-dir=/some/where/else", "train", "--learning-rate=0.1"], plugins=PLUGINS)
    from vergeml.env import ENV
    assert ENV.get('trainings-dir') == '/some/where/else'


@command()
@option('learning-rate', type=float, default=0.001, validate='>0')
class CommandTest(CommandPlugin):
    def __call__(self, args, env):
        return args


@command('train')
@option('learning-rate', type=float, validate='>0')
class CommandTest2(CommandPlugin):
    def __call__(self, args, env):
        return args


@command(free_form=True)
@option('<topic>', type=str)
@option('@AI', type='Optional[@]')
class CommandTest3(CommandPlugin):
    def __call__(self, args, env):
        return args

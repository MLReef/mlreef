from vergeml.env import Environment
from vergeml.plugins import _DictPluginManager
from vergeml.model import ModelPlugin, model
from vergeml.command import command, train
from vergeml.option import option
from vergeml.__main__ import run

# TODO test setting defaults

class ModelTest(ModelPlugin):
    @command()
    @option('learning-rate', default=0.001)
    def train(self, args, env):
        return args


def test_instantiate_model():
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.model', 'test-model', ModelTest)
    env = Environment(model='test-model', plugins=PLUGINS)
    assert isinstance(env.model_plugin, ModelTest) == True

def test_run_model_function():
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.model', 'test-model', ModelTest)
    assert run(["--model=test-model", "train"], plugins=PLUGINS) == {'learning-rate': 0.001}

def test_run_model_function_params():
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.model', 'test-model', ModelTest)
    assert run(["--model=test-model", "train", "--learning-rate=0.1"], plugins=PLUGINS) == {'learning-rate': 0.1}


def test_run_model_function_project_file(tmpdir):
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.model', 'test-model', ModelTest)
    d1 = tmpdir.mkdir("p1")
    p1 = d1.join("vergeml.yaml")
    p1.write("model: test-model\ntrain:\n  learning-rate: 0.002")
    assert run(["-f"+str(p1), "train"], plugins=PLUGINS) == {'learning-rate': 0.002}
    assert run(["-f"+str(p1), "train", "--learning-rate=0.3"], plugins=PLUGINS) == {'learning-rate': 0.3}

class ModelTest2(ModelPlugin):

    @command()
    @option('layers', default=3)
    @option('learning-rate', default=0.001)
    def train(self, args, env):
        name = env.start_training(hyperparameters={'layers': args['layers']})
        args.update({'name': name})
        return args

    @command()
    @option('<images>', type=list)
    @option('@AI')
    def predict(self, args, env):
        return env.get('hyperparameters')

def test_start_training(tmpdir):
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.model', 'test-model', ModelTest2)
    d1 = tmpdir.mkdir("p1")
    p1 = d1.join("vergeml.yaml")
    p1.write("model: test-model\ntrain:\n  learning-rate: 0.002\n")
    res = run(["--project-dir="+str(d1), "train"], plugins=PLUGINS)
    assert res['layers'] == 3
    assert res['learning-rate'] == 0.002
    assert 'name' in res and res['name'] is not None


def test_recover_hyper(tmpdir):
    PLUGINS = _DictPluginManager()
    PLUGINS.set('vergeml.model', 'test-model', ModelTest2)
    d1 = tmpdir.mkdir("p1")
    p1 = d1.join("vergeml.yaml")
    p1.write("model: test-model\ntrain:\n  learning-rate: 0.002\n")
    res = run(["--project-dir="+str(d1), "train"], plugins=PLUGINS)

    name = res['name']
    assert run(["--project-dir="+str(d1), f"@{name}", "predict", "test.png"], plugins=PLUGINS) == \
           {'layers': 3}


@model('bigger', descr='A test model with more functions.')
class BiggerModelPluginTest(ModelPlugin):

    class TheModel:
        def __init__(self, labels):
            self.labels = labels

        def train(self, learning_rate, epochs, batch_size, decay, dropout, layers, optimizer,
                  early_stopping_delta, early_stopping_patience, xy_train, xy_val, xy_test):
            return {'acc': 0.5}

    @train('train', descr='Train a test model.')
    @option('learning-rate', 0.0001)
    @option('epochs', 5)
    @option('batch-size', 64)
    @option('decay', 0.)
    @option('dropout', 0.)
    @option('layers', 1, 'Number of fully connected layers')
    @option('optimizer', 'sgd', validate=('adam', 'sgd'))
    @option('early-stopping-delta', 0.0)
    @option('early-stopping-patience', 0, 'Early stopping patience (0 means off). ')
    @option('name', None, type='Optional[str]', descr='Optional name of the AI.')

    def train(self, args, env):
        # configure libraries
        env.configure('keras')

        # load data

        modargs = dict(labels=env.data.meta['labels'])
        trainargs = dict(xy_train=env.data.load('train', view='batch', randomize=True),
                         xy_val=env.data.load('val', view='iter', randomize=False),
                         xy_test=env.data.load('test', view='iter', randomize=False))

        # start training
        env.start_training(name=args['name'],
                           hyperparameters={'layers': args['layers'], 'labels': modargs['labels']})

        # load the model
        self.model = BiggerModelPluginTest.TheModel(**modargs)

        # call helper method so we don't have to format arguments manually
        trainargs.update(env.args_for(self.model.train, args))
        trainargs['callbacks'] = [env.keras_callback()]

        final_results = self.model.train(**trainargs)

        # done
        env.end_training(final_results)

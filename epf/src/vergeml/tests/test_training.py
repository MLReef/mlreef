from vergeml.env import Environment
from vergeml.display import Display, BufferOutput
import os.path
import yaml

def test_training(tmpdir):
    d1 = tmpdir.mkdir("p1")
    buffer = BufferOutput()
    display = Display(stdout=buffer, stderr=buffer)
    env = Environment(project_dir=str(d1), display=display)
    _name = env.start_training()
    callback = env.progress_callback(epochs=10, steps=100)
    callback(0, 1, acc=0.56, loss=1.234)
    callback(0, 2, acc=0.56, loss=1.234, val_acc=0.77)
    callback(1, 1, acc=0.56, loss=1.234)
    callback(9, 99, acc=0.78, loss=0.837, val_acc=0.67)
    env.end_training(final_results=dict(val_acc=0.77))
    assert env.get('results.val-acc') == 0.77
    with open(os.path.join(env.trained_model_dir(), "data.yaml")) as f:
        data_yaml = yaml.safe_load(f)
    with open(os.path.join(env.stats_dir(), "stats.csv")) as f:
        stats_csv = f.read()
    assert data_yaml['results']['status'] == 'FINISHED'
    assert data_yaml['results']['val-acc'] == 0.77
    assert data_yaml['results']['acc'] == 0.78

    assert stats_csv == """\
epoch,step,acc,loss,val-acc,val-loss
0,1,0.56,1.234,,
0,2,0.56,1.234,0.77,
1,1,0.56,1.234,0.77,
9,99,0.78,0.837,0.67,
"""

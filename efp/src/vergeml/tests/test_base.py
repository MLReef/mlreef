from vergeml.command import Command
from vergeml.option import Option
from vergeml.utils import VergeMLError
import pytest

def test_cast_any():
    assert Option(name='any_option').cast_value('xyz') == 'xyz'


def test_cast_bool():
    assert Option(name='bool_option', type=bool).cast_value(True) == True
    assert Option(name='bool_option', type=bool).cast_value(False) == False
    assert Option(name='bool_option', type=bool).cast_value('on') == True
    assert Option(name='bool_option', type=bool).cast_value('off') == False

    with pytest.raises(VergeMLError):
        Option(name='bool_option', type=bool).cast_value('falsch') == False

    with pytest.raises(VergeMLError):
        Option(name='bool_option', type=bool).cast_value(1) == True


def test_cast_int():
    assert Option(name='int_option', type=int).cast_value(1) == 1
    assert Option(name='int_option', type=int).cast_value(1.5) == 1
    assert Option(name='int_option', type=int).cast_value('123') == 123
    with pytest.raises(VergeMLError):
        Option(name='int_option', type=int).cast_value('x123') == 123


def test_cast_float():
    assert Option(name='float_option', type=float).cast_value(1) == 1.
    assert Option(name='float_option', type=float).cast_value(1.5) == 1.5
    assert Option(name='float_option', type=float).cast_value('123') == 123.
    assert Option(name='float_option', type=float).cast_value('123.5') == 123.5
    with pytest.raises(VergeMLError):
        Option(name='float_option', type=float).cast_value('x123.5') == 123.5


def test_cast_str():
    assert Option(name='str_option', type=str).cast_value("abc") == "abc"
    assert Option(name='str_option', type=str).cast_value(1.5) == "1.5"
    assert Option(name='str_option', type=str).cast_value('123') == "123"
    assert Option(name='str_option', type=str).cast_value('off') == 'off'
    with pytest.raises(VergeMLError):
        Option(name='str_option', type=str).cast_value({}) == {}


def test_cast_none():
    assert Option(name='none_option', type=type(None)).cast_value(None) == None
    assert Option(name='none_option', type=type(None)).cast_value("NULL") == None
    with pytest.raises(VergeMLError):
        assert Option(name='none_option', type=type(None)).cast_value("Nichts") == None


def test_cast_dict():
    assert Option(name='dict_option', type=dict).cast_value(dict(x=1, y=2)) == dict(x=1, y=2)
    assert Option(name='dict_option', type=dict).cast_value({}) == {}
    with pytest.raises(VergeMLError):
        assert Option(name='dict_option', type=dict).cast_value('{}') == {}


def test_cast_list():
    assert Option(name='list_option', type=list).cast_value([1,2,3,4]) == [1,2,3,4]
    assert Option(name='list_option', type=list).cast_value([]) == []
    with pytest.raises(VergeMLError):
        assert Option(name='list_option', type=list).cast_value(()) == ()

def test_cast_list_str():
    assert Option(name='list_option', type='List[str]').cast_value(["a", "b", "c"]) == ["a", "b", "c"]
    assert Option(name='list_option', type='List[str]').cast_value([]) == []
    assert Option(name='list_option', type='List[str]').cast_value([1, 2, 3]) == ["1", "2", "3"]
    with pytest.raises(VergeMLError):
        assert Option(name='list_option', type='List[str]').cast_value([True, False]) == ["True", "False"]


def test_cast_list_int():
    assert Option(name='list_option', type='List[int]').cast_value(["1", "2", "3"]) == [1, 2, 3]
    assert Option(name='list_option', type='List[int]').cast_value([]) == []
    assert Option(name='list_option', type='List[int]').cast_value([1, 2, 3]) == [1, 2, 3]
    with pytest.raises(VergeMLError):
        assert Option(name='list_option', type='List[int]').cast_value(["1.0", "2.0"]) == [1, 2]


def test_cast_list_float():
    assert Option(name='list_option', type='List[float]').cast_value(["1", "2", "3"]) == [1., 2., 3.]
    assert Option(name='list_option', type='List[float]').cast_value([]) == []
    assert Option(name='list_option', type='List[float]').cast_value([1., 2., 3.]) == [1., 2., 3.]
    assert Option(name='list_option', type='List[float]').cast_value([1, 2, 3]) == [1., 2., 3.]
    assert Option(name='list_option', type='List[float]').cast_value(["1.0", "2.0"]) == [1, 2]
    with pytest.raises(VergeMLError):
        assert Option(name='list_option', type='List[float]').cast_value(["one", "two"]) == [1., 2.]


def test_cast_optional():
    assert Option(name='optional_option', type='Optional[str]').cast_value("abc") == "abc"
    assert Option(name='optional_option', type='Optional[str]').cast_value(None) == None


def test_cast_union():
    assert Option(name='union_option', type='Union[int,str]').cast_value("abc") == "abc"
    assert Option(name='union_option', type='Union[int,str]').cast_value(1) == 1
    assert Option(name='union_option', type='Union[int,str]').cast_value("1") == 1
    with pytest.raises(VergeMLError):
        assert Option(name='union_option', type='Union[int,str]').cast_value(True) == True


def test_validate_int():
    Option(name='int_option_1', validate='>=0').validate_value(1)
    Option(name='int_option_2', validate='>=0').validate_value(0)
    Option(name='int_option_3', validate='<=0').validate_value(0)
    Option(name='int_option_4', validate='<=0').validate_value(-1)
    Option(name='int_option_5', validate='<0').validate_value(-1)
    Option(name='int_option_6', validate='>0').validate_value(1)

    with pytest.raises(VergeMLError):
        Option(name='int_option_7', validate='>=0').validate_value(-1)

    with pytest.raises(VergeMLError):
        Option(name='int_option_8', validate='<=0').validate_value(1)

    with pytest.raises(VergeMLError):
        Option(name='int_option_9', validate='<0').validate_value(1)

    with pytest.raises(VergeMLError):
        Option(name='int_option_10', validate='>0').validate_value(-1)


def test_validate_float():
    Option(name='float_option_1', validate='>=0').validate_value(0.1)
    Option(name='float_option_2', validate='>=0').validate_value(0.0)
    Option(name='float_option_3', validate='<=0').validate_value(0.0)
    Option(name='float_option_4', validate='<=0').validate_value(-0.)
    Option(name='float_option_5', validate='<0').validate_value(-0.1)
    Option(name='float_option_6', validate='>0').validate_value(0.1)

    with pytest.raises(VergeMLError):
        Option(name='float_option_7', validate='>=0').validate_value(-0.1)

    with pytest.raises(VergeMLError):
        Option(name='float_option_8', validate='<=0').validate_value(0.1)

    with pytest.raises(VergeMLError):
        Option(name='float_option_9', validate='<0').validate_value(0.1)

    with pytest.raises(VergeMLError):
        Option(name='float_option_10', validate='>0').validate_value(-0.1)


def _val_fn(opt, value):
    if value % 5 != 0:
        raise VergeMLError(f"Invalid value for option {opt.name}.")


def test_validate_fn():
    Option(name='fn_option', type=int, validate=_val_fn).validate_value(5)

    with pytest.raises(VergeMLError, match=r'Invalid value for option fn_option\.'):
        Option(name='fn_option', type=int, validate=_val_fn).validate_value(6)

def test_validate_in():
    Option(name='in_option', type=int, validate=(1,2,3,4,5)).validate_value(5)

    with pytest.raises(VergeMLError, match=r'Invalid value for option in_option\.'):
        Option(name='in_option', type=int, validate=(1,2,3,4,5)).validate_value(6)

    Option(name='in_option', type=int, validate=("adam", "sgd")).validate_value("adam")
    with pytest.raises(VergeMLError, match=r'Invalid value for option in_option\.'):
        Option(name='in_option', type=int, validate=("adam", "sgd")).validate_value("sgf")

def test_command_1():
    cmd = Command('train', options=[Option('epochs', 20, int, validate='>=1')])
    assert cmd.parse(["train", "--epochs=14"]) == {'epochs': 14}

    with pytest.raises(VergeMLError):
        cmd.parse(["train", "--epochs=abc"])

    with pytest.raises(VergeMLError):
        cmd.parse(["train", "--epochz=14"])

    with pytest.raises(VergeMLError):
        cmd.parse(["train", "--epochs=-1"])


def test_command_2():
    cmd = Command('run', options=[Option('<args>', type=list), Option('@AIs', type=list)])
    assert cmd.parse(["run", "tensorboard"]) == {'@AIs': [], '<args>': ["tensorboard"]}
    assert cmd.parse(["@funky-terminator", "run", "tensorboard"]) == \
        {'@AIs': ['funky-terminator'], '<args>': ["tensorboard"]}
    assert cmd.parse(["@funky-terminator", "@touchy-brobot", "run", "tensorboard", "--port=2204"]) == \
                    {'@AIs': ['funky-terminator', 'touchy-brobot'], '<args>': ["tensorboard", "--port=2204"]}


def test_command_3():
    cmd = Command('predict', options=[Option(name="@AI")])
    assert cmd.parse(["@stubborn-dishwasher", "predict"]) == {'@AI': 'stubborn-dishwasher'}
    with pytest.raises(VergeMLError):
        cmd.parse(["predict"])


def test_command_4():
    cmd = Command('predict', options=[Option(name="@AI", type="Optional[@]")])
    assert cmd.parse(["@stubborn-dishwasher", "predict"]) == {'@AI': 'stubborn-dishwasher'}
    assert cmd.parse(["predict"]) == {'@AI': None}


def test_command_5():
    options = [
        Option('threshold', type=float, validate=">0", short='t'),
        Option('id', default=False, type=bool, flag=True, short='i')
    ]
    cmd = Command('predict', options=options)
    assert cmd.parse(["predict", "--threshold=0.2"]) == {'threshold': 0.2, 'id': False}
    assert cmd.parse(["predict", "-t0.2"]) == {'threshold': 0.2, 'id': False}
    assert cmd.parse(["predict", "-t0.2", "--id"]) == {'threshold': 0.2, 'id': True}
    assert cmd.parse(["predict", "-t0.2", "-i"]) == {'threshold': 0.2, 'id': True}

def test_command_6():
    cmd = Command('new', options=[Option(name='<project-name>', type='str')])
    assert cmd.parse(["new", "xxx"]) == {'<project-name>': "xxx"}
    with pytest.raises(VergeMLError):
        cmd.parse(["new"])


def test_command_7():
    cmd = Command('help', options=[Option(name='<topic>'),
                                   Option(name="@AI", type='Optional[@]')], free_form=True)
    assert cmd.parse(["@funky-robot", "help", "--option=xyz", "something"]) == \
           ('funky-robot', ["--option=xyz", "something"])

    assert cmd.parse(["help", "--option=xyz", "something"]) == \
           (None, ["--option=xyz", "something"])


USAGE_1 = """
Usage:
  ml new <project-name>
""".strip()
def test_command_usage1():
    cmd = Command('new', options=[Option(name='<project-name>')])
    assert cmd.usage() == USAGE_1


USAGE_2 = """
Usage:
  ml train [options]

Options:
  --learning-rate    Optimizer learning rate. [default: 0.0001]
""".strip()
def test_command_usage2():
    cmd = Command('train', options=[Option(name='learning-rate', default=0.0001)])
    assert cmd.usage() == USAGE_2


USAGE_3 = """
Usage:
  ml train [options]

Options:
  -l, --learning-rate    Optimizer learning rate. [default: 0.0001]
""".strip()
def test_command_usage3():
    cmd = Command('train', options=[Option(name='learning-rate', default=0.0001, short='l')])
    assert cmd.usage() == USAGE_3

USAGE_4 = """
Usage:
  ml @AI predict [options]

Options:
  @AI            The name of a trained model.
  --threshold    Prediction Threshold. [default: 0.2]
""".strip()
def test_command_usage4():
    cmd = Command('predict', options=[
        Option(name='@AI'),
        Option(name='threshold', default=0.2, descr="Prediction Threshold.")
    ])
    assert cmd.usage() == USAGE_4

USAGE_5 = """
Usage:
  ml train --optimizer=<optimizer> [options]

Options:
  --optimizer            Which optimizer to use.
  -l, --learning-rate    Optimizer learning rate. [default: 0.0001]
""".strip()

def test_command_usage5():
    cmd = Command('train', options=[
        Option(name='optimizer', type=str),
        Option(name='learning-rate', default=0.0001, short='l')
    ])
    assert cmd.usage() == USAGE_5

USAGE_6 = """
Usage:
  ml train [options]

Options:
  --a    [default: A]
  --b    [default: B]
  --c    [default: C]
""".strip()
def test_command_usage6():
    cmd = Command('train', options=[
        Option(name='a', type=str, default="A"),
        Option(name='b', type=str, default="B"),
        Option(name='c', type=str, default="C"),
    ])
    assert cmd.usage() == USAGE_6

USAGE_7 = """
Usage:
  ml predict [options] <file>

Options:
  --a    [default: A]
  --b    [default: B]
  --c    [default: C]
""".strip()
def test_command_usage7():
    cmd = Command('predict', options=[
        Option(name='<file>'),
        Option(name='a', type=str, default="A"),
        Option(name='b', type=str, default="B"),
        Option(name='c', type=str, default="C"),
    ])
    assert cmd.usage() == USAGE_7

USAGE_8 = """
Usage:
  ml predict [options] [<file>]

Options:
  --a    [default: A]
  --b    [default: B]
  --c    [default: C]
""".strip()
def test_command_usage8():
    cmd = Command('predict', options=[
        Option(name='<file>', type='Optional[str]'),
        Option(name='a', type=str, default="A"),
        Option(name='b', type=str, default="B"),
        Option(name='c', type=str, default="C"),
    ])
    assert cmd.usage() == USAGE_8

USAGE_9 = """
Usage:
  ml predict [options] [<file>]

Options:
  --a       [default: A]
  --b       [default: B]
  --c       [default: C]
  <file>    The file to use when predicting.
""".strip()
def test_command_usage9():
    cmd = Command('predict', options=[
        Option(name='<file>', type='Optional[str]', descr="The file to use when predicting."),
        Option(name='a', type=str, default="A"),
        Option(name='b', type=str, default="B"),
        Option(name='c', type=str, default="C"),
    ])
    assert cmd.usage() == USAGE_9


USAGE_10 = """
Usage:
  ml [@AI] predict [options]

Options:
  @AI            The name of a trained model.
  --threshold    Prediction Threshold. [default: 0.2]
""".strip()
def test_command_usage10():
    cmd = Command('predict', options=[
        Option(name='@AI', type="Optional[@]"),
        Option(name='threshold', default=0.2, descr="Prediction Threshold.")
    ])
    assert cmd.usage() == USAGE_10

USAGE_11 = """
Usage:
  ml [@AIs ...] predict [options]

Options:
  @AIs           A list of trained models.
  --threshold    Prediction Threshold. [default: 0.2]
""".strip()
def test_command_usage11():
    cmd = Command('predict', options=[
        Option(name='@AIs', type="List[@]"),
        Option(name='threshold', default=0.2, descr="Prediction Threshold.")
    ])
    assert cmd.usage() == USAGE_11

USAGE_12 = """
Make a prediction.

Usage:
  ml [@AIs ...] predict [options]

Options:
  @AIs           A list of trained models.
  --threshold    Prediction Threshold. [default: 0.2]
""".strip()
def test_command_usage12():
    cmd = Command('predict', long_descr="Make a prediction.", options=[
        Option(name='@AIs', type="List[@]"),
        Option(name='threshold', default=0.2, descr="Prediction Threshold.")
    ])
    assert cmd.usage() == USAGE_12

USAGE_13 = """
Make a prediction.

Usage:
  ml [@AIs ...] predict [options]

Options:
  @AIs           A list of trained models.
  --threshold    Prediction Threshold. [default: 0.2]

Examples:
  ml @skynet predict
""".strip()
def test_command_usage13():
    cmd = Command('predict', long_descr="Make a prediction.", examples="ml @skynet predict", options=[
        Option(name='@AIs', type="List[@]"),
        Option(name='threshold', default=0.2, descr="Prediction Threshold.")
    ])
    assert cmd.usage() == USAGE_13

USAGE_14 = """
Make a prediction.

Usage:
  ml [@AIs ...] predict [options]

Options:
  @AIs           A list of trained models.
  --threshold    Prediction Threshold. [default: 0.2]
""".strip()
def test_command_usage14():
    cmd = Command('predict', descr="Make a prediction.", options=[
        Option(name='@AIs', type="List[@]"),
        Option(name='threshold', default=0.2, descr="Prediction Threshold.")
    ])
    assert cmd.usage() == USAGE_14

def test_human_type():
    assert Option(name="x", type=int).human_type() == "int"
    assert Option(name="x", type='int').human_type() == "int"
    assert Option(name="x", type='float').human_type() == "float"
    assert Option(name="x", type='str').human_type() == "string"
    assert Option(name="x").human_type() == ""
    assert Option(name="x", type=list).human_type() == "list"
    assert Option(name="x", type="@").human_type() == "trained model"
    assert Option(name="x", type="Optional[@]").human_type() == "optional trained model"
    assert Option(name="x", type="File").human_type() == "file"
    assert Option(name="x", type="Optional[File]").human_type() == "optional file"
    assert Option(name="x", type='int', validate='>=2').human_type() == "int >=2"
    assert Option(name="x", type='Optional[int]').human_type() == 'optional int'
    assert Option(name="x", type='Union[int, None]').human_type() == 'optional int'
    assert Option(name="x", type='Union[int, str]').human_type() == 'int or string'
    assert Option(name="x", type='Union[int, str, float]').human_type() == 'int, string or float'
    assert Option(name="x", type='float', default=0.001).human_type() == "float, default: 0.001"

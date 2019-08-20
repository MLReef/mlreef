from typing import List, Generator, Any, Tuple, Union
import operator
import random
from vergeml.io import Sample
from vergeml.utils import VergeMLError, SPLITS
from copy import copy
from vergeml.option import option, Option
from vergeml.plugins import PLUGINS

_OPERATION_META_KEY = '__vergeml_operation__'

# TODO should all operations take the apply parameter?
def operation(name, descr=None, long_descr=None, topic='general', apply=True):
    """Define an operation.

    :param name:        Name of the operation.
    :param descr:       A short description of the operation
    :param long_descr:  A long description
    :param apply:       If the preprocessing operation takes the apply parameter.
    """
    def decorator(o):
        assert getattr(o, _OPERATION_META_KEY, None) is None

        options = Option.discover(o)
        cmd = Operation(name,
                        descr=descr,
                        long_descr=long_descr,
                        apply=apply,
                        options=options,
                        topic=topic)
        setattr(o, _OPERATION_META_KEY, cmd)
        return o
    return decorator

class Operation:
    def __init__(self, name, descr=None, long_descr=None, apply=True, topic='general', options=[], plugins=PLUGINS):
        self.name = name
        self.descr = descr
        self.long_descr = long_descr
        self.apply = apply
        self.options = options
        self.plugins = plugins
        self.topic = topic

    @staticmethod
    def discover(o, plugins=PLUGINS):
        res = None
        if hasattr(o, _OPERATION_META_KEY):
            res = getattr(o, _OPERATION_META_KEY)
            res.plugins = plugins
            for option in res.options:
                option.plugins = plugins
        return res


class BaseOperation:
    """Base class for processing samples.

    This class can be used to augment, filter, transform and combine samples.
    To support this variety of use-cases, BaseOperation offers fine-grained control
    over how samples are being processed.

    When an operation changes the number of output samples, it must return the
    factor in multiplier().
    """

    def configuration(self):
        """Return the configuration of the BaseOperation instance.

        Since operations play a role in data processing, any change in a operation
        pipeline must result in a different hash value for a dataset. To capture the
        configuration of a preprocessing operation, BaseOperation defines this method,
        which can be overridden when needed.
        """
        return self.__dict__

    def process(self, sample: Sample, ops=List['BaseOperation']) -> Generator[Sample, None, None]:
        """Complete a processing step in the pipeline and run the next one.

        :param sample: The sample to be processed
        :param ops: The next operations to run

        :return: A generator yielding samples

        The process function is expected to first transform the sample and then to call
        the next BaseOperation, yielding the resulting sample as a return value.
        """
        raise NotImplementedError

    def multiplier(self) -> float:
        """Return the factor by which the operation changes the number of output samples"""
        return 1.0


class OperationPlugin(BaseOperation):
    """Simplified Operations.

    Most operations will not need the raw power of BaseOperation, so an easier to use
    class is provided. In addition to simplified processing, it also offers the following
    functionality:

    - control which split the operation is applied to
    - TODO control which labels the operation is applied to
    - control if the operation is applied to the samples or the ground truth or both.
    - Automatic type checking so that an operation is only applied to supported sample data.
    """

    # To implement  type checking functionality, a subclass has to set this field to the type it
    # can handle. If it can handle multiple types, Union[Type1, Type2, ..] can be used
    type = Any

    # apply can be set from the operation configuration. it can be a comma separated string, a
    # tuple or None.
    apply = None

    def __init__(self, apply=None):
        """
        :param apply: a tuple, a comma separated string or None
                      possible values are a combination of:
                        - x: apply the operation to the sample only
                        - y: apply the operation to the label only
                        - train: apply the operation only to the train split
                        - val: apply the operation only to the val split
                        - test: apply the operation only to the test split
                        - all: apply the operation to all
        """
        super().__init__()

        assert isinstance(apply, (list, tuple, str, type(None)))

        if apply == 'all':
            self.apply = set()
        elif isinstance(apply, (list, tuple)):
            self.apply = set(apply)
        elif isinstance(apply, str):
            self.apply = set(map(operator.methodcaller('strip'), apply.split(",")))
        else:
            self.apply = set()
            # CORRECT:
            # self.apply = {'train'}

    def transform(self, data: Any, rng: random.Random) -> Any:
        """Transform either x or y.

        :param data: the data to transform
        :param rng: the random generator

        :return: the transformed data

        transform() will pass in data, which can be either x or the y.
        When x and y of the same sample are processed with transform, the random number
        generator will be reset on the second call so that both pieces of data are
        processed with the same random numbers.
        """
        raise NotImplementedError

    def transform_xy(self, x: Any, y: Any, rng: random.Random) -> Tuple[Any, Any]:
        """Transform x and y values.

        :param x: the sample data
        :param y: the ground truth
        :param rng: random generator

        :return: a tuple (x, y)

        When you need to transform x and y values in the same method, for example
        when they are images with different sizes and they need to be resized to have
        the same size, override this method.
        """
        rngstate = rng.getstate()
        appxy = self.apply.intersection({'x', 'y'})

        if not appxy or 'x' in self.apply:
            if _type_good(self.type, type(x)):
                rng.setstate(rngstate)
                x = self.transform(x, rng)

        if not appxy or 'y' in self.apply:
            if _type_good(self.type, type(y)):
                rng.setstate(rngstate)
                y = self.transform(y, rng)

        return x, y

    def transform_sample(self, sample: Sample) -> Sample:
        """Transform a sample.
        :param sample: the sample to transform

        :return: the transformed sample:

        When you don't care about the apply functionality and just want to process the
        sample, override this method.
        """
        if self.apply.intersection(set(SPLITS)) \
                and sample.meta['split'] not in self.apply:
            yield sample
        else:
            x, y = self.transform_xy(sample.x, sample.y, sample.rng)
            yield Sample(x, y, sample.meta, sample.rng)

    def process(self, sample: Sample, ops=List[BaseOperation]) -> Generator[Sample, None, None]:

        for s1 in self.transform_sample(sample):
            if not ops:
                yield s1
            else:
                nextop, *rest = ops
                yield from nextop.process(s1, rest) # pylint: disable=E1101

    def configuration(self):
        # CORRECT:
        # res = self.__dict__.copy()
        # if 'apply' in res:
        #     res['apply'] = list(sorted(res['apply']))
        return self.__dict__.copy()


def _type_good(t1, t2):
    return t1 == Any or t1 == t2 or \
           (getattr(t1, '__origin__', None) == Union and t2 in t1.__args__)

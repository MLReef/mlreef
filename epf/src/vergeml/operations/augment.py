from vergeml.operation import operation, OperationPlugin
from vergeml.option import option
from vergeml.utils import VergeMLError, SPLITS
from copy import copy

@operation('augment', descr="Augment a sample by producing multiple variants.", topic="general")
@option('variants', validate='>0', type=int)
class AugmentOperation(OperationPlugin):

    def __init__(self, variants, apply=None):
        super().__init__(apply)

        if not isinstance(variants, int):
            raise VergeMLError("The parameter 'variants' of 'augment' must be of type 'int'.")

        self.variants = variants

    def transform_sample(self, sample):
        if self.apply.intersection(set(SPLITS)) \
                and sample.meta['split'] not in self.apply:
            yield sample
        else:
            for _ in range(self.variants):
                yield copy(sample)

    def multiplier(self):
        return self.variants

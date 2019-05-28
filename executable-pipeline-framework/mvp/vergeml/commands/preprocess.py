"""Preprocess command.
"""
import os.path
from vergeml.utils import VergeMLError, SPLITS
from vergeml.loader import LiveLoader
from vergeml.command import command
from vergeml.option import option
from vergeml.command import CommandPlugin

# pylint: disable=R0903

@command('preprocess', descr="Preprocess samples and save the output. ")
@option('<directory>', type='str', descr="Output directory.", default="pre")
@option('split', type='str', descr="The split to process.", default="all",
        validate=('train', 'val', 'test', 'all'))
@option('num-samples', type='Optional[int]', default=None,
        descr="The number of samples to process.", short='n')
class PreprocessCommand(CommandPlugin):
    """Preprocess samples and save the output.
    """

    def __call__(self, args, env):

        output_dir = args['<directory>']

        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        res = _preview(env.data, output_dir, args['split'], args['num-samples'])

        if not res:
            raise VergeMLError("Command preprocess not supported.")


def _preview(data, output_dir, split, num_samples):
    if not data.output.supports_preview():
        return False

    data.output.begin_preview(output_dir)

    loader = LiveLoader(data.cache_dir, data.input, data.ops, output=data.output)
    loader.transform = False
    loader.begin_read_samples()
    total = 0

    for split_ in SPLITS:
        if split not in ('all', split_):
            continue

        mul = int(loader.multipliers[split_])

        for index in range(loader.num_samples(split_)):
            if num_samples is not None and total >= num_samples:
                break

            samples = loader.read_samples(split_, index, mul)

            for sample in samples:
                data.output.write_preview(output_dir, split_, sample)

            total += 1


    loader.end_read_samples()
    data.output.end_preview(output_dir)

    return True

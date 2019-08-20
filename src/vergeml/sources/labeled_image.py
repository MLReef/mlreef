from vergeml.img import INPUT_PATTERNS, open_image, fixext, ImageType
from vergeml.io import source, SourcePlugin, Sample
from vergeml.data import Labels
from vergeml.utils import VergeMLError, xlink
from vergeml.option import option
import random
import numpy as np
from PIL import Image
import os.path
import json
from operator import methodcaller
import io
from copy import deepcopy


@source('labeled-image', descr="Load labeled images.")
@option('oversample', descr="Oversamples labels.", type=dict, yaml_only=True, default={})
class LabeledImageSource(SourcePlugin):
    input_patterns = INPUT_PATTERNS
    classes = None

    def __init__(self, config: dict={}):
        self.files = None
        self.oversample = deepcopy(config.get('oversample', dict()))
        super().__init__(config)


    def begin_read_samples(self):
        if self.files:
            return

        classes_path = os.path.join(self.samples_dir, "classes.json")
        classes_are_directories = False

        if os.path.exists(classes_path):
            self._get_classes_from_json()
        else:
            classes_are_directories = True
            self._get_classes_from_dirs()

        if not self.meta['labels']:
            raise VergeMLError("No labels found.")

        self.files = self.scan_and_split_files(self._scan_dirs(classes_are_directories))


        if self.oversample:

            nfiles = {}

            for split, filenames in self.files.items():

                if split == 'test':
                    # don't augment test samples
                    nfiles['test'] = filenames
                    continue

                nfiles[split] = []
                for filename, meta in filenames:
                    # nfile = self.normalize_filename(split, filename)
                    labels = self.classes["files"][filename]

                    nfiles[split].append((filename, meta))
                    for k, v in self.oversample.items():
                        if k in labels:
                            for _ in range(v-1):
                                nfiles[split].append((filename, meta))

            self.files = nfiles


    def num_samples(self, split: str) -> int:
        return len(self.files[split])

    def _get_classes_from_json(self):

        for filename in ("labels.txt", "classes.json"):
            path = os.path.join(self.samples_dir, filename)
            if not os.path.exists(path):
                raise VergeMLError("{} is missing".format(filename))

            with open(path) as f:
                if filename == "labels.txt":
                    items = filter(None, map(methodcaller("strip"), f.read().splitlines()))
                    labels = Labels(items)
                else:
                    self.classes = json.load(f)
        files = {}
        # prefix the sample with input_dir
        for k, v in self.classes['files'].items():

            # on windows and linux, separator is /
            path = k.split("/")
            path.insert(0, self.samples_dir)
            fname = os.path.join(*path)
            files[fname] = v

        self.classes['files'] = files
        self.meta['labels'] = labels

    def _get_classes_from_dirs(self):

        dirs = list(filter(None, (self.samples_dir, self.val_dir, self.test_dir)))

        # get label names from directories
        items = os.listdir(dirs[0])
        items = filter(lambda d: os.path.isdir(os.path.join(self.samples_dir, d)), items)
        items = filter(lambda d: not d.startswith("."), items)
        labels = Labels(sorted(items))

        self.classes = dict(files=dict())
        for label in labels:
            for dir in dirs:
                dir_label = os.path.join(dir, label)
                if os.path.exists(dir_label):
                    for root, _, filenames in os.walk(dir_label):
                        for file in filenames:
                            absfile = os.path.join(root, file)
                            self.classes["files"][absfile] = [label]
        self.meta['labels'] = labels


    def _scan_dirs(self, classes_are_directories):
        # when we are not restoring from cache, we only want to return the
        # files from classes.json
        if not classes_are_directories:
            res = dict(train=[], val=[], test=[])

            # classes.json might have a section where splits are set on a per
            # file basis. Use this to decide the split when it exists
            splits = self.classes.get('split', dict())
            for file in self.classes['files']:
                split = splits[file] if file in splits else 'train'
                res[split].append(file)

            # In case splits where determined by classes.json, turn off automatic
            # split
            if len(res['val']) or len(res['test']):
                # turn off by setting everything to None
                for k in ('val_num', 'val_perc', 'val_dir', 'test_num', 'test_perc', 'test_dir'):
                    setattr(self, k, None)

            #train, val, test = res['train'], res['val'], res['test']
        else:
            # otherwise, the superclass implementation will handle scanning
            # samples_dir
            train, val, test = super().scan_dirs()
            res = dict(train=train, val=val, test=test)

        return res['train'], res['val'], res['test']

    def read_samples(self, split, index, n=1):
        items = self.files[split][index:index+n]
        items = [(open_image(filename), filename, meta) for filename, meta in items]

        res = []
        for img, filename, meta in items:
            rng = random.Random(str(self.random_seed) + meta['filename'])
            y = Labels(self.classes["files"][filename])
            res.append(Sample(img, y, meta.copy(), rng))

        return res


    def hash(self, state) -> str:
        state = io.BytesIO(state.encode('utf8'))
        state.write(str(self.oversample).encode('utf8'))
        return super().hash(state.getvalue().decode('utf8') + self.hash_files(self.files))

    def transform(self, sample):
        onehot = np.array([float(label in sample.y) for label in self.meta['labels']])
        sample.x = np.asarray(sample.x)
        sample.y = onehot
        return sample

    def begin_preview(self, output_dir):
        # generate data dir
        data_dir = os.path.join(output_dir, ".data")
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)

    def supports_preview(self):
        return True

    def write_preview(self, output_dir: str, split: str, sample: Sample):

        # make sure x and y have the right types
        if not isinstance(sample.x, ImageType):
            raise VergeMLError("Can't write sample with type: {}".format(type(sample.x)))

        if not isinstance(sample.y, Labels):
            raise VergeMLError("Can't write ground truth with type: {}".format(type(sample.y)))

        # get the right filename in .data to write the sample to
        data_dir = os.path.join(output_dir, ".data")
        name = fixext(os.path.basename(sample.meta['filename']), sample.x)
        path = self.preview_filename(os.path.join(data_dir, name))
        sample.x.save(path)

        # create directories and hyperlinks so that split and label are visible in a file
        # manager
        for label in sample.y:
            link_dir = os.path.join(output_dir, split, label)
            if not os.path.exists(link_dir):
                os.makedirs(link_dir)
            link_path = self.preview_filename(os.path.join(link_dir, name))
            xlink(os.path.abspath(path), link_path)

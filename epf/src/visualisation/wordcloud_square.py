# MLReef-2020 square wordcloud from simple text using default arguments.
# rewritten from the script https://github.com/amueller/word_cloud/tree/master/examples/simple.py

import os
import argparse
import sys
from pathlib import Path

from os import path
from wordcloud import WordCloud, STOPWORDS


class MyWordCloud:
    def __init__(self, params):
        self.input_dir = params['input_path']
        self.output_dir = params['output_path']

        # create folder if does not exists
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
            # Please add here the extensions that you need
        self.ext = ['.txt', '.csv']

    def __execute__(self):
        stopwords = set(STOPWORDS)
        for root, dirs, files in os.walk(self.input_dir):
            for file in files:
                if file.endswith(tuple(self.ext)):
                    textfile = os.path.join(root, file)
                    # Read the whole text.
                    text = open(textfile).read()
                    # lower max_font_size
                    fullpath, extension = os.path.splitext(textfile)
                    # Generate a word cloud image
                    wordcloud = WordCloud(max_font_size=40, stopwords=stopwords).generate(text)
                    relative_p = os.path.relpath(fullpath, self.input_dir)
                    folders = os.path.split(relative_p)[0]
                    Path(os.path.join(self.output_dir, folders)).mkdir(parents=True, exist_ok=True)
                    image = wordcloud.to_image()
                    image.save(os.path.join(self.output_dir, '{}_wordcloud{}'.format(relative_p, '.jpg')))
        print("Wordcloud done")
        return 1


def process_arguments(args):
    parser = argparse.ArgumentParser(description='word cloud from text')
    parser.add_argument('--input-path', action='store', help='path to the text file')
    parser.add_argument('--output-path', action='store', default='.', help='path to save the image')
    params = vars(parser.parse_args(args))
    if (params['input_path'] or params['output_path']) is None:
        parser.error("Paths are required. You did not specify input path or output path.")
    return params


if __name__ == "__main__":
    print("Beginning execution of wordcloud_square.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    op = MyWordCloud(params)
    print("input path:", op.input_dir)
    print("output path:", op.output_dir)
    op.__execute__()


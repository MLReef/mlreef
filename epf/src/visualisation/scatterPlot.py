import pandas as pd
import numpy as np
import os
import argparse
import sys
from pathlib import Path
import matplotlib.pyplot as plt


class MyScatterPlot:
    def __init__(self, params):
        self.input_dir = params['input_path']
        self.output_dir = params['output_path']
        self.data_x = params['column_x']
        self.data_y = params['column_y']
        self.label_x = params['label_x']
        self.label_y = params['label_y']
        self.title = params['title']


        # create folder if does not exists
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
            # Please add here the extensions that you need
        self.ext = ['.csv']

    def __execute__(self):
        for root, dirs, files in os.walk(self.input_dir):
            for file in files:
                if file.endswith(tuple(self.ext)):
                    csvfile = os.path.join(root, file)
                    fullpath, extension = os.path.splitext(csvfile)
                    fig = plt.figure()
                    ax = fig.add_axes([0.1,0.1,0.8,0.8])
                    df_data = pd.read_csv(csvfile)
                    ax.set_xlabel(self.label_x)
                    ax.set_ylabel(self.label_y)
                    ax.set_title(self.title)
                    ax.scatter(x=df_data.iloc[:, self.data_x], y=df_data.iloc[:, self.data_y])
                    relative_p = os.path.relpath(fullpath, self.input_dir)
                    folders = os.path.split(relative_p)[0]
                    Path(os.path.join(self.output_dir, folders)).mkdir(parents=True, exist_ok=True)
                    fig.savefig(os.path.join(self.output_dir, '{}_scatterPlot{}'.format(relative_p, '.png')))
        print("scatterPlot done")
        return 1


def process_arguments(args):
    parser = argparse.ArgumentParser(description='word cloud from text')
    parser.add_argument('--input-path', type=str, action='store', help='path to the text file')
    parser.add_argument('--output-path', type=str, action='store', default='.', help='path to save the image')
    parser.add_argument('--column-x', type=int, action='store', default=0, help='Select CSV column data to plot in axis x')
    parser.add_argument('--column-y', type=int, action='store', default=1, help='Select CSV column data to plot in axis y')
    parser.add_argument('--label-x', type=str, action='store', default='x', help='Label for axis x')
    parser.add_argument('--label-y', type=str, action='store', default='y', help='Label for axis y')
    parser.add_argument('--title', type=str, action='store', default='x vs. y', help='Title of plot')
    params = vars(parser.parse_args(args))
    if (params['input_path'] or params['output_path']) is None:
        parser.error("Paths are required. You did not specify input path or output path.")
    return params


if __name__ == "__main__":
    print("Beginning execution of scatterPlot.py script ......... \n")
    params = process_arguments(sys.argv[1:])
    op = MyScatterPlot(params)
    print("input path:", op.input_dir)
    print("output path:", op.output_dir)
    op.__execute__()

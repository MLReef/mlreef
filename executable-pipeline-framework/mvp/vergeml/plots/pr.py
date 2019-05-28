from vergeml.command import command, CommandPlugin
from vergeml.option import option
from vergeml.plots import load_labels

import os.path
import csv
from vergeml.utils import VergeMLError
import numpy as np

@command('pr', descr="Plot a precision/recall curve.")
@option('@AI')
@option('class', type='str', descr="The positive class.")

# TODO add plots for multi label
class PRPlot(CommandPlugin):

    def __call__(self, args, env):

        import numpy as np
        import matplotlib.pyplot as plt
        from sklearn.metrics import average_precision_score
        from sklearn.metrics import precision_recall_curve
        from vergeml.plots import load_labels, load_predictions

        try:
            labels = load_labels(env)
        except FileNotFoundError:
            raise VergeMLError("Can't plot PR curve - not supported by model.")

        nclasses = len(labels)
        if args['class'] not in labels:
            raise VergeMLError("Unknown class: " + args['class'])

        try:
            y_test, y_score = load_predictions(env, nclasses)
        except FileNotFoundError:
            raise VergeMLError("Can't plot PR curve - not supported by model.")

        # From:
        # https://scikit-learn.org/stable/auto_examples/model_selection/plot_precision_recall.html#sphx-glr-auto-examples-model-selection-plot-precision-recall-py

        ix = labels.index(args['class'])
        y_test = y_test[:,ix].astype(np.int)
        y_score = y_score[:,ix]

        precision, recall, _ = precision_recall_curve(y_test, y_score)
        average_precision = average_precision_score(y_test, y_score)

        plt.step(recall, precision, color='b', alpha=0.2, where='post')
        plt.fill_between(recall, precision, alpha=0.2, color='b', step='post')

        plt.xlabel('Recall ({})'.format(args['class']))
        plt.ylabel('Precision ({})'.format(args['class']))
        plt.ylim([0.0, 1.05])
        plt.xlim([0.0, 1.0])
        plt.title('Precision-Recall curve for @{0}: AP={1:0.2f}'.format(args['@AI'], average_precision))
        plt.show()

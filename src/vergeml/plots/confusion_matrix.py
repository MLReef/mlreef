from vergeml.command import command, CommandPlugin
from vergeml.option import option
from vergeml.plots import load_labels

import os.path
import csv
from vergeml.utils import VergeMLError
import numpy as np

@command('confusion-matrix', descr="Plot a confusion matrix.")
@option('@AI')
@option('normalize', type='bool', default=False, descr="When true normalize the confusion matrix.", short="n", flag=True)
class ConfusionMatrixPlot(CommandPlugin):

    def __call__(self, args, env):
        # Plotting a confusion matrix needs the model to follow the convention
        # - labels.txt in checkpoints
        # - predictions.csv in stats

        import itertools
        import numpy as np
        import matplotlib.pyplot as plt
        from sklearn.metrics import confusion_matrix
        from vergeml.plots import load_labels, load_predictions

        try:
            labels = load_labels(env)
        except FileNotFoundError:
            raise VergeMLError("Can't plot confusion matrix - not supported by model.")

        nclasses = len(labels)

        try:
            y_test, y_score = load_predictions(env, nclasses)
        except FileNotFoundError:
            raise VergeMLError("Can't plot confusion matrix - not supported by model.")

        # From:
        # https://scikit-learn.org/stable/auto_examples/model_selection/plot_confusion_matrix.html#sphx-glr-auto-examples-model-selection-plot-confusion-matrix-py

        def plot_confusion_matrix(cm, classes, AI,
                                  normalize=False,
                                  cmap=plt.cm.Blues): # pylint: disable=E1101
            """
            This function prints and plots the confusion matrix.
            Normalization can be applied by setting `normalize=True`.
            """
            if normalize:
                cm = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis]
                plt.title(f"Confusion matrix for @{AI} (normalized)")
            else:
                plt.title(f'Confusion matrix for @{AI}')

            plt.imshow(cm, interpolation='nearest', cmap=cmap)

            plt.colorbar()
            tick_marks = np.arange(len(classes))
            plt.xticks(tick_marks, classes, rotation=45)
            plt.yticks(tick_marks, classes)

            fmt = '.2f' if normalize else 'd'
            thresh = cm.max() / 2.
            for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
                plt.text(j, i, format(cm[i, j], fmt),
                        horizontalalignment="center",
                        color="white" if cm[i, j] > thresh else "black")

            plt.ylabel('True label')
            plt.xlabel('Predicted label')
            plt.tight_layout()

        y_test = np.argmax(y_test, axis=1)
        y_pred = np.argmax(y_score, axis=1)
        cnf_matrix = confusion_matrix(y_test, y_pred)
        np.set_printoptions(precision=2)


        plt.figure()
        plot_confusion_matrix(cnf_matrix, normalize=args['normalize'], classes=labels, AI=args['@AI'])
        plt.show()

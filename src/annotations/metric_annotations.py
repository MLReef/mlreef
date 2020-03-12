import argparse
import sys
from keras import backend as K


class metric(object):

    def __init__(self, name, ground_truth, prediction):
        self.name = name
        self.y_true = ground_truth
        self.y_pred = prediction

    def recall(self, y_true, y_pred):
        print("Running Recall function")
        true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
        possible_positives = K.sum(K.round(K.clip(y_true, 0, 1)))
        recall = true_positives / (possible_positives + K.epsilon())
        return recall

    def precision(self, y_true, y_pred):
        true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
        predicted_positives = K.sum(K.round(K.clip(y_pred, 0, 1)))
        precision = true_positives / (predicted_positives + K.epsilon())
        return precision

    def f1_score(self, y_true, y_pred):
        precision = self.precision(y_true, y_pred)
        recall = self.recall(y_true, y_pred)
        return 2 * ((precision * recall) / (precision + recall + K.epsilon()))

    def __call__(self, f):

        def wrapped_function(*args):
            if self.name == 'recall':
                global result
                result = self.recall(self.y_true, self.y_pred)

            if self.name == 'precision':
                global result
                result = self.precision(self.y_true, self.y_pred)

            if self.name == 'f1':
                global result
                result = self.f1_score(self.y_true, self.y_pred)

            f(*args)

        return wrapped_function

from vergeml.utils import VergeMLError
import os.path
import csv
import numpy as np

def load_labels(env):
    path = os.path.join(env.checkpoints_dir(), "labels.txt")

    if not os.path.exists(path):
        raise FileExistsError(path)
    
    with open(path) as labelsfile:
        labels = labelsfile.read().strip().splitlines()
        return labels

def load_predictions(env, nclasses):
    path = os.path.join(env.stats_dir(), "predictions.csv")

    if not os.path.exists(path):
        raise FileExistsError(path)

    with open(path, newline='') as csvfile:
        y_score = []
        y_test = []
        csv_reader = csv.reader(csvfile, dialect="excel")
        for row in csv_reader:
            assert len(row) == nclasses * 2
            y_score.append(list(map(float, row[:nclasses])))
            y_test.append(list(map(float, row[nclasses:])))
        
        y_score = np.array(y_score)
        y_test = np.array(y_test)

        return y_test, y_score
    
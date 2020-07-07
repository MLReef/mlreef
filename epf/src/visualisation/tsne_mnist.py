import time
import numpy as np
import pandas as pd
from sklearn.datasets import fetch_openml,fetch_mldata
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import seaborn as sns

mnist = fetch_mldata("MNIST original")
X = mnist.data / 255.0
y = mnist.targetprint(X.shape, y.shape)
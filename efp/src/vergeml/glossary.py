PARAM_DESCR = {
    'epochs': 'How many epochs to train.',
    'learning rate': 'Optimizer learning rate.',
    'batch size': 'The number of samples to use in one training batch.',
    'decay': 'Learning rate decay.',
    'early stopping': 'Early stopping delta and patience.',
    'dropout': 'Dropout rate.',
    'layers': 'The number of hidden layers.',
    'optimizer': 'Which optimizer to use.'
}

LONG_DESCR = {
    'learning rate': 'A hyperparameter which determines how quickly new learnings override old ones during training. In general, find a learning rate that is low enough that the network will converge to something useful, but high enough that the training does not take too much time.',

    'batch size': 'Defines the number of samples to be propagated through the network at once in a batch. The higher the batch size, the more memory you will need.',

    'epochs': 'The number of epochs define how often the network will see the complete set of samples during training.',

    'decay': 'When using learning rate decay, the learning rate is gradually reduced during training which may result in getting closer to the optimal performance.',

    'early stopping': 'Early Stopping is a form of regularization used to avoid overfitting when training. It is controlled via two parameters: Delta defines the minimum change in the monitored quantity to qualify as an improvement. Patience sets the number of epochs with no improvement after which training will be stopped.',

    'dropout': 'Dropout is a regularization technique for reducing overfitting in neural networks, The term "dropout" refers to dropping out units (both hidden and visible) in a neural network during training.',

    'layers': 'Deep learning models consist of a number of layers which contain one or more neurons. Typically, the neurons in one layer are connected to the next. Models with a higher number of layers can learn more complex representations, but are also more prone to overfitting.',

    'optimizer': 'The algorithm which updates model parameters such as the weight and bias values when training the network.',

    'sgd': 'Stochastic gradient descent, also known as incremental gradient descent, is a method for optimizing a neural network. It is called stochastic because samples are selected randomly instead of as a single group, as in standard gradient descent.',

    'adam': 'The Adam optimization algorithm is an extension to stochastic gradient descent which computes adaptive learning rates for each parameter. Adam is well suited for many practical deep learning problems.',

    'environment variables': """\
The following environment variables are available in VergeML:
- VERGEML_PERSISTENCE The number of persistent instances
- VERGEML_THEME The theme of the command line application
- VERGEML_FUNKY_ROBOTS Funky robots""",

    "overfitting": "When a model performs well on the training samples, but is not able to generalize well to unseen data. During training, a typical sign for overfitting is when your validation loss goes up while your training loss goes down.",

    "underfitting": "When a model can neither model the training data nor generalize to new data.",

    "hyperparameters": "Hyperparameters are the parameters of a model that can be set from outside, i.e. are not learned during training. (e.g. learning rate, number of layers, kernel size).",

    "random seed": "An integer value that seeds the random generator to generate random values. It is used to repeatably reproduce tasks and experiments.",

    "project": "A VergeML project is just a directory. Typically it contains a vergeml.yaml file, a trainings directory and a samples directory.",

    'project file': "A YAML file you can use to configure models, device usage, data processing and taks options.",

    'checkpoint': 'A checkpoint is a static image of a trained AI. It can be used to restore the AI after training and make predictions.',

    'stats': 'Stats are used to measure the performance of a model (e.g. accuracy).',

    'samples': 'Samples are pieces of data (e.g. images, texts) that is being used to train models to create AIs.',

    'val split': "Samples different from training samples that are used to evaluate the performance of model hyperparameters. You can set it via the --val-split option. See 'ml help split'.",

    'test split': "Samples different from training samples that are used to evaluate the final performance of the model. You can set it via the --test-split option. See 'ml help split'.",

    'split': 'split is a part of the sample data reserved for validation and testing (--val-split and --test-split options). It can be configured as either a percentage value (e.g. --val-split=10%) to reserve a fraction of training samples, a number to reserve a fixed number of samples, or a directory where the samples of the split are stored.',

    'cache dir': 'A directory which contains the processed data.',

}

SYNONYMS = {
    'stochastic gradient descent': 'sgd',
    'hyperparameter': 'hyperparameters',
    'project dir': 'project',
    'training samples': 'samples',
    'overfit': 'overfitting',
    'underfit': 'underfitting'
}

def long_descr(key):
    key = key.replace("-", " ")
    key = SYNONYMS.get(key, key)
    return LONG_DESCR.get(key, "").strip()

def short_param_descr(key):
    key = key.replace("-", " ")
    key = SYNONYMS.get(key, key)
    return PARAM_DESCR.get(key, "").strip()


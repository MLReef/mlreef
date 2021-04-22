# Experiments

An experiment is the act of information processing based on data patterns of an model. The output is generally a model that 
can be used for example to predict or classify learned patterns. 

In MLReef you have a built-in experiment pipeline, which allows you train one model at a time. 

## How to create a new Experiment

1. Navigate to your repository, to Experiments and click the button `New Experiment`
2. Click the folder `Data` and select the correct data folder for your experiment.
3. Drag a suitable model from the right hand list to the main area in the center.
4. Set all necessary parameters for this model. If you need help, you can always view the README of the model in its repository.
5. Execute the experiment pipeline through the modal. 

## Current limitations

These are the limitations currently present in MLReef for experiments: 

1. The experiment pipeline does not support **parallel execution** of more than one experiment pipeline. The second experiment will start as soon as the first one is finished.
2. The experiments will currently always run on a GPU machine.
3. Hyperparameter tuning is currently not supported.
4. Only hosted execution is possible using mlreef.com. We are working on being able to download a pipeline for local execution. 

## Name convention

**Experiment:** represent all functions to train models. The name experiment surged due to the iterative nature of model training.

**Algorithm:** Is the architecture of a machine learning script. In MLReef we took the convention to call them models (mostly for simplicity reasons).

**Model:** In MLReef this is an algorithm before and after training. 

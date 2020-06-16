# Experiments

An experiment is the act of information processing based on data patterns of an algorithm. The output is generally a model that 
can be used for example to predict or classify learned patterns. 

In MLReef you have a built-in experiment pipeline. 

## Ho to create a new Experiment

1. Navigate to your repository, to Experiments and click the button `New Experiment`
2. Click the folder `Data` and select the correct data folder for your experiment
3. Drag a suitable algorithm from the right hand list to the main area in the center.
4. Set all necessary parameters for this model.


## Current limitations

These are the limitations currently present in MLReef for experiments: 

1. The experiment pipeline does not support **parallel execution** of more than one algorithm at the time.
2. The experiments will currently always run on a GPU machine.
3. Hyperparameter tuning is currently not supported.
4. Only hosted execution is possible. We are working on local execution.

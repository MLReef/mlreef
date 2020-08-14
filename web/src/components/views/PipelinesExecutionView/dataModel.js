// ------------------ Instructions information ------------------------ //

export const dataPipelineInstructionData = {
  id: 'PipeLineView',
  titleText: 'How to use data ops pipelines:',
  paragraph: `Data ops processes your data through a pipeline. The result is a new dataset. To create a data ops pipeline, select your data you want to process.
  Then select one or multiple data operations from the right. The order of the selected data operations matter, as the first one is executed first and the subsequent
  follow. The result of a data ops pipeline is a new branch with the old data and the new data combined. Use a different output path, to separate the input data from
  the output data.`
}

export const experimentInstructionData = {
  id: 'NewExperiment',
  titleText: 'How to create a new experiment:',
  paragraph: `In an experiment, you can train a model on your data. First, select your data you want to do your experiment on. Do not mind about splitting your data into
    training / validation set, as these are handled by the models themself. Select a model from the right and drag in into your experiment pipeline. Note, that currently
    we support only one model to be trained at the time. Input or adapt the parameters of a model and execute your experiment. A new entry with all relevant information, 
    metrics and model binaries will be created and are accessible in the experiments section.`,
};

export const dataVisualizationInstuctionData = {
  id: 'EmptyDataVisualization',
  titleText: 'How to create a data visualization:',
  paragraph: `A data visualization pipeline creates an output file - most of the times an image or something similar, which lets you visualize your data structure. To
  create a data visualization, first, select your data you want to analyze. Then select one data visualization from the right and drag it into your data visualization
  pipeline. Note, that we currently support only one data visualization to be created at the time. The output will be stored in your data visualization view, together
  with your input data used.`,
}
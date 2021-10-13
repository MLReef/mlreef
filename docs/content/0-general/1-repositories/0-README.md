# Repositories

MLReef is based on Git repositories for ML projects, Algorithm, DataOps and Data Visualizations. Here you will find their main characteristics and differences.

## Repository types 

There are 4 types of repositories in MLReef accessible via the project overview. 

![repositories](/repositories.png)

### ML Projects 

We like to call them data repositories, as in them, you can unload all your data for your ML project. In these repositories you can use the [data pipelines](docs/content/data20%pipelines/README.md) and the execute your  to train your Algorithm. 

### Model 

The Model repositories, together with DataOps and Data Visualization repositories are, for us, code repositories. These are very similar to already known code repositories, such as from [GitLab](https://gitlab.com). 

You can work on your code and use the power of Git to collaborate and version your source code. Use the [release model](docs/content/general/concepts/releasing.md) function to release your model to be explorable and used in the MLReef [experiment pipelines](docs/content/experiments/README.md). 

> A Model repository becomes inmediately explorable in your projects overview. When creating your model, be sure to select the visibility level (private or public). 

### DataOps

The DataOps repositories are also code repositories - they are meant to store your DataOps code. They are explorable and usable in the DataOps pipeline in the ML Project repository, as soon as you [released](docs/content/general/concepts/releasing.md) them. 

### Data Visualization

The Data Visualization repository is also a code repository, similar to the Model and DataOps repository. You can create data visualizations with the aim to generate visualization files for your data (e.g. an image or an interactive d3 file). 



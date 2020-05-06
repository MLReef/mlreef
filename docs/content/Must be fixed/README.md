# (Must be fixed)

User Docs
====================

Welcome to MLReef! 

As one of our first (alpha) users you will have complete access to all currently available functions in MLReef.  

> MLReef is currently on **closed alpha** and therefore, this documentation is subject to change. 

> If you need support and you can´t find help here, don´t hesitate to either [raise a ticket](https://gitlab.com/mlreef/frontend/issues), connect with the MLReef community through our [slack channel](https://mlreef.com) or send us an email at hello@mlreef.com. 


Overview
--------------------

MLReef is the first of its kind MLOps platform, that will allow you to create and manage your Machine Learning (ML) projects fast, efficiently, reproducible and cohesively. 

For more information, see [all MLReef features](https://www.mlreef.com).


## Concepts

To get familiar with the concepts to create and manage ML projects in MLReef, read the following articles: 

*  [alpha demo: this might be the best start for all alpha users!](../User_Documentation)
*  [MLReef workflow](../User_Documentation)
*  [ML projects](../User_Documentation)


Use cases
--------------------

MLReef is a git-based platform that integrates a great number of essential tools and community-based ML elements for creating, managing and (soon) deploying ML projects: 

*  Hosting data driven ML repositories 
*  Running data visualization operations to understand your data distribution
*  Running data processing pipelines to adapt your data to your use case
*  Reviewing changes in your data through merge requests and differential views
*  Creating experiments with plug-and-play and state-of-the-art ML models
*  Understanding a models performance by having full disclosure on each preceeding value-added step
*  Download the models and metric parameters for your ML application


ML projects
--------------------

In MLReef you can create ML projects to host and manage your data sets, create data visualizations and data processing pipelines to final experiments. 

> MLReef is designed for **very fast and reproducible iterations** for data processing and model training so you can reach higher model quality in much less time. 

*  **Data repository**: A git-based repository which stores your data sets for your ML project. 
*  **Data instances**: These are data sets resulting from your data processing pipelines which can be reviewed, saved as a new branch or merged into an existing one or directly used for your model training. 
*  **Experiments**: Experiments are the single-source-of-truth behind your model training. They host all value added steps, training log and model binaries.
   [how to run experiments](pipelines/experiment.md)


Pipelines
--------------------

In MLReef there are currently three different types of drag-and-drop pipelines: 

*  **Data visualization**: The goal of a data visualization is to better understand your data, as ML models rely deeply on accurate data distribution for best real-live performance.
*  **Data processing**: Use built-in pre-processing operations to rapidly and reproducibly enhance, adapt or filter unlimited data points and files.
*  **Experiments**: Train models in parallel and track all relevant metrics to compare and find the best performing model. 

Visit the [pipelines section](pipelines/) for more details. 

Git and MLReef
--------------------

Learn what is [Git](../User_Documentation) and its best practices. 

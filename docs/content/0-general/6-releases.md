# Releases

> MLReef is currently in closed early access. Thing will change on a day to day basis! 

This will guide you through the most significant changes in MLReef. We will try to keep it updated as much as we can. 


## Release log 

### r-02-01/2021
This release moves MLReef to beta stage, involving broad changes to the entire infrastructure and baseline. 

Now, you can: 
* Create code projects (repositories)
  * Publish code repositories
  * Re-publish code repositories via the publishing wizard or via commit to master of your code repository master branch
  * Published code projects are stored in a docker registry and explorable / usable in the data pipelines directly
* General stability and improved test coverage
* Many smaller features, such as creating new files
* Ad-hoc visualizations based on tabular data (insights/graphs)
* Move to kubernetes cluster (for hosted version)
* Development of "Nautilus", an offline and on-premise version of MLReef


### r-01-08/2020

In this release we included: 

* Create ML projects
* Use basic repository functions, such as creating branches, merging and reviewing MR. 
* Upload data into your ML project
* Create basic experiments
  *  You can only use one experiment at the time. Currently only ResNet 50 Model (images) and a dummy model are included.
  *  Training log
  *  Download experiment artifacts (such as the model binary and metric values)
  *  Visualize experiment details with params and data source.
* Create basic data processing pipeline (DataOps)
  *  You can create data pipelines using 3 available data operations for **images**
  *  Concatenate data processors in one pipeline (order is kept)
  *  Creates Dataset (currently hold as a separate branch - you can merge it into your data repository)
* Create basic data visualization using currently only one operator (t-SNE)
* Infrastructure supports GPU and CPU execution

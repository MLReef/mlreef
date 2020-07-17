# Releases

> MLReef is currently in closed early access. Thing will change on a day to day basis! 

This will guide you through the most significant changes in MLReef. We will try to keep it updated as much as we can. 


## Release log 

### r-05/2020

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

# General concepts

MLReef is an [MLOPs](0-mlops/0-README.md) platform focused on collaboration. In MLReef we aim to integrate all required value added steps in one platform. 

Machine Learning is based on the convergence of two major elements, data and code with the goal to enable automated information processing. This very general concept provides our guideline to create meaningfull features with the underlying focus on collaboration between teams and througout the entire MLReef community. 

The following links provide documentation for each MLOps stage: 

| Concepts  | Documentation for  |
|---|---|
| [Data vs code repositories](#repos)  | Types of GIT repositories. |
| [Data pipeline types](#pipelines)  | Data pipelines and experiments. |
| [Publishing code repositories](#publishing)  | Accessing code repositories in pipelines. |
| [Marketplace](#marketplace)  | All about discoverability of community content. |


## <a name="repos"></a> Data vs code repositories

You will find two different types of [git](2-new_to_git.md) repositories: 

* **Data repositories**: For hosting ML projects.
* **Code repositories**: For hosting data operators. 

### Data repositories host ML projects

We like to call them data repositories because

 1. they host the data and data pipelines for creating ML models and 
 2. because they are as standard based on [git lfs](1-git/0-README.md). 

You can create or access existing ML projects (=data repositories) through the [marketplace](#marketplace).

![marketplace](/marketplace.png)

>The goal within data repositories is to cover the actual value added steps in creating and deploying a ML model. 

In the next chapter we will talk about the different data pipelines existing in data repositories. 

## <a name="pipelines"></a> Data pipeline types

In MLReef you can find three different types of data pipelines: 
1. Data visualization pipelines
2. Data processing pipelines (called **DataOps**)
3. Experiment pipelines

All these are found within ML projects (data repositories), where you can use your data for processing. 

You can view more detailed information about each pipeline in the corresponding section: 

| Pipeline types  | Documentation for  |
|---|---|
| [Data visualization](../../1-data_pipelines/1-data_visualization/0-README.md)  | Pipeline for creating data visualizations. |
| [DataOps](../../1-data_pipelines/0-dataops/0-README.md)  | Pipeline for automated processing of your data. |
| [Experiments](../../2-experiments/0-README.md)  | Pipeline for creating ML models. |

## <a name="publishing"></a> Publishing code repositories

As described in the chapter [Data vs code repositories](#repos), there exist two types of repositories for ML projects (data) and code (i.e. python scripts). 

Within a ML project you can executing data pipelines. The elements of each pipeline is: 
1. data (stored in data repositories)
2. code (stored in code repositories)

![DataOps pipeline](dataops_pipeline.png)

To make a code repository (i.e. script) available in a data pipeline, one must first publish the code repository. Publishing means, that a code repository will either be publicly or privatly (dependent on the visibility level of the repository) available within the corresponding pipeline: 

* Scripts from DataOps repositories will be available in the DataOps piepeline.
* Scripts from Data Visualization repositories will be available in the Data Visualization pipeline.
* Scripts from Model repositories will be available in the Experiment pipeline.

> The concept of data vs code repositories is to separate concerns and to have full reproducibility and easy accessability.

Here you can find a detailed chapter for [publishing](5-publishing.md).

## <a name="marketplace"></a> Marketplace

Independemt of any publishing process as described above, all repositories (data and code) are accessible and discoverable in the marketplace. 

![Marketplace](explore_marketplace.png)

The major differentiations are: 

### Repository type 

A repository can either be found in: 

1. ML Projects = data repositories
2. Models = code repositories
3. Data Ops = code repositories
4. Data Visualizations = code repositories

### Visibility level

When creating a new project (e.g. ML project, a Model) you can select the visibility - either as private or as public. 

**Private**: These repositories are **only** accessible by you or by your [project members](../3-settings/1-users.md). 
**Public**: These repositories are accessible to **everyone**.

### Ownership 

Projects can either be external (not owned by you) or owned by you or your [group](../3-settings/2-groups.md). You will find owned projects under the **My xxx** tab, wheras not owned projects can be found in the **Explore** tab. 

> You can take ownership of an external project by forking the project.
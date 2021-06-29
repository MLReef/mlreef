# Machine Learning (ML) projects
A ML Project is the place where you can save your data and execute the pipelines.

You can upload you data manually through the GUI, also you can use Git commands. The ML Project is the place to use all your code repositories.

## How to create a ML Project
1. In the dashboard you can select from the dropdown list in the right side, click *New ML project*.

2. Add the name, description and data type of your project. You can also decide if it is going to be public of private.

3. Finally you must add some data, you can clone the project in your local, then copy the data into the folder that you clone and use the terminal:
```shell
git add --all
git commit -m "your commit message"
git push origin master
```
Git is going to ask you for the username and password, use the ones that you set up in MLReef.



The Project has two buttons:

### DataOps: 
Here you can start dataOps pipeline where you can transform the data.

### Visualizations: 

Here you can start a visualization pipeline where you can execute visualizations of your data.

You will also find a tab name *Experiments*, here you can start Model pipelines, where you can execute experiments with your data.

In the tab *Insights* you can see the terminal log during the execution of the experiments.


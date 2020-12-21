Code Projects
===================

Code projects (or code repositories) are git based repositories to store your ML function. These are either `Models` or `Data Operations (Data Ops)` or `Data Visualizaions`. 

The idea is that each code project hosts a specfic and atomic function. This way, you and your team (or the entire community) can use this script freely and project unbound within the built-in datapipelines within the ML projects (the other tab in the dashboard). 

**For example:** You might create a code project just to rotate images. Or, you just create a new model (algorithm) that you want to share. 

You can create new code projects by the dashboard view when selecting the corresponding card. Remember to set the visibility level according to your objective (as these will be passed on to the published code modules)

> **Please keep in mind, that you need to publish your code project before it is discoverable and usable within the data-pipelines!**


Publishing a code project
--------------------

Publishin a code project will containerize your script with all required packages and environment variables and make your function discoverable and usable within the data pipelines in MLReef. Use a model repository to publish a new model (or algorithm) that than can be found and used in the experiment section within a ML project. 

We call a published code repository a code module, as these are modules than you or your team can use atomically in the data pipelines. 

In your code repository you will find a publishing wizard (accessible via the `publish` button).Follow these instructions and start an automatic publishing pipeline to publish your code. 

In order to publish, you will need the following files placed in your `master` branch in your code project: 

- At least **one python file** that serves as an entry point for your ML function. This python file should contain the parameter annotations to make the parameter adjustable later on. 
- A requirement.txt file (named exactly reuirement.txt) that describes the libraries (packages) your script requires. Please do not forget to include the version, for example by adding `==1.0` after the package. 

> If your code project (repostory) is set to **private**, the usable code module in the data pipelines will inherit this setting. If only have access to the code repository, then only you will be able to see and use it. 

## What does the publishing process do?

The publishing process will containerize your script. During this process, the annotations will be stored, the packages as described in the `requirements.txt` file will be installed using `pip` and the docker image will be created and published. 

> Every time you push a new change to `master` a new automatic publishing pipeline will start, overwriting your existing image with the new changes. 

**Your script will only be explorable and usable in the data pipelines, when the publishing pipeline succeeded. ** This way we can guarantee a qualitative standard for the scripts. 



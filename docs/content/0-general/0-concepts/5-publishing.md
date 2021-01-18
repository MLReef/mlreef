# Publishing code repositories

Publishing a code project will containerize your script with all required packages and environment variables and make your function discoverable and usable within the data pipelines in MLReef. Use a model repository to publish a new model (or algorithm) that than can be found and used in the experiment section within a ML project. 

We call a published code repository a code module, as these are modules than you or your team can use atomically in the data pipelines. 

In your code repository you will find a publishing wizard (accessible via the `publish` button). Follow these instructions and start an automatic publishing pipeline to publish your code. 

In order to publish, you will need the following files placed in your `master` branch in your code project: 

- At least **one python file** that serves as an entry point for your ML function. This python file should contain the parameter annotations to make the parameter adjustable later on. 
- A requirements file (named exactly requirements.txt) that describes the libraries (packages) your script requires. Please do not forget to include the version, for example by adding `==1.0` after the package name. 

> If your code project (repository) is set to **private**, the usable code module in the data pipelines will inherit this setting. If only have access to the code repository, then only you will be able to see and use it. 

To view all details on how to publish a code repository, visit this section: [publishing a code project](../../4-code-projects/1-publishing_code_repository.md)

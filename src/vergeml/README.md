![VergeML](https://github.com/vergeml/vergeml/raw/master/docs/img/header.png "VergeML")


VergeML is a **command line based environment** for exploring, training and running state-of-the-art Machine Learning models. It provides ***ready-to-use models***, handles ***data preprocessing and augmentation***, tracks your AI's ***training sessions*** and provides other goodies such as an ***automatic REST interface***.

Here is how it looks in action:

<img src="https://github.com/vergeml/vergeml/raw/master/docs/img/term.png" alt="terminal" width="691px"/>

Installation
============

VergeML runs on Windows, Linux and MacOS. You need to have Python 3.6 and [TensorFlow installed](docs/installation.md).

Get VergeML via pip:

    pip install vergeml

Verify your installation by typing:

    ml help

Congratulations, you have successfully installed VergeML! If you need further help, see the full [installation guide](docs/installation.md).

Quick Start
===========

Let's create a very simple image classifier which tells apart cats from dogs.

First, we create a new project for our classifier. Projects help you organize your data, save your training results and compare the performance between trained AIs.

Go to the directory where you want to create your project and type:

    ml --model=imagenet new cats_dogs

This sets up a model based on [Keras](https://keras.io) called ```imagenet```, which is based on transfer learning.

Let's change to this project directory and have a look:

    cd cats_dogs

VergeML will automatically create a samples folder and a configuration file (vergeml.yaml). Among other things, this configuration file defines the current model.

Let's get some help on what we can do with the current model:

    ml help

In the output you will see a section on model functions. It says we have two model functions, train and predict. Let's try training first!

Start training!
-----------

To start training an AI we will need a dataset:

    ml download:cats-and-dogs

> Info: VergeML provides several datasets to get you started. To see a list type ```ml help download```

After the download has finished, you will see a lot of images in your ```samples``` directory divided into two folders: cats and dogs.

Later, when you use your own data, simply copy your images into subdirectories of the samples directory. VergeML will automatically pick up the directory names as labels.

To start training, type:

    ml train

As a first step, VergeML will feed each of our images into a pretrained neural network, extract their features as output and cache it on disk. (On a GPU, this will typically take around 15 minutes.) Then it will train a new neural network based on this output. As a last step it will combine these two networks into a single network tailored for our task of classifying cats and dogs. This process is called "transfer learning".

VergeML will print out the test accuracy after our training is finished to evaluate the model's final performance. Our cats-and-dogs classifier achieves 98.6%, which is pretty good.

> Info: By default, VergeML reserves 10% of your samples as validation and 10% as testing data. This step is required to measure the accuracy of your model.

We can inspect our model's performance using the list command:

    ml list

This will give you the name (prefixed by the @ sign) and several performance metrics.

For instance, the training accuracy (```acc```) will tell you how good your AI can classify the images it sees during training, while validation accuracy (```val_acc```) tells you how well it performs with unseen images.

Using the AI from the command line
-----------

Our cats-and-dogs classifier is now ready to use. Let's point it to an image of a cat or a dog and see what it predicts:

    ml @name-of-your-AI predict <filename>

> Info: You can even point it to a directory: ```ml @name-of-your-AI predict my_cats_and_dogs_pictures/*```

Launching a REST service
-----------
Finally, let's deploy our newly trained AI on a web service:

    ml @name-of-your-AI run:rest

VergeML provides an API explorer that will launch in a new browser window. (If you don't want the browser to open use the ```--no-browser``` option.)

For example, to use the REST interface with cURL:

    curl -F 'files=@path/to/image' http://localhost:2204/predict


License
============
[MIT](/LICENSE)

Copyright (c) 2018-2019 Markus Ecker

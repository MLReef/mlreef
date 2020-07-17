# Use cases

This section will help you understand the use cases you can build using MLReef. 

We are continuously providing new use cases based on different data types and objectives. 

## Image classification

Image classification refers to the task of extracting information classes from a multiband raster image. The resulting raster from image classification can be used to create thematic maps. Depending on the interaction between the analyst and the computer during classification, there are two types of classification: supervised and unsupervised.

### Supervised

Supervised classification uses the spectral signatures obtained from training samples to classify an image. 

The simplest way to create a dataset for supervised learning is by putting your images in this directory form:

train/
    class 1/
    class 2/
    ...
    class n/

This way, the model understands that the subdirectory (e.g. class1/) is the first label. For simplicity, its always easy to rename
the subdirectories to your label class.

#### Cats and dogs

Use this [Cats and Dogs](1-catsanddogs.md) ML project example to create a model to classify cats between dogs using images.

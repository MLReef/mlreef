Installation guide
============

This chapter contains all necessary information to properly install VergeML.

Requirements
------------

- [Python 3.6.7](https://www.python.org/downloads/release/python-367/)

- TensorFlow (GPU support recommended)


Installing TensorFlow with GPU support:
------------

Install Tensorflow with GPU support enabled through pip:

        pip install tensorflow_gpu

Tensorflow needs [CUDA 9.0](https://developer.nvidia.com/cuda-90-download-archive) installed.

You will also need [cuDNN v7.0.5 for CUDA 9.0](https://developer.nvidia.com/cudnn) installed. Note: you will have to create an NVIDIA membership account to download the files. This [cuDNN installation guide](https://docs.nvidia.com/deeplearning/sdk/cudnn-install/index.html) can help you to install cuDNN on your machine. 

Installing TensorFlow without GPU support:
------------

    pip install tensorflow


Install VergeML:
------------

    pip install vergeml

Troubleshooting
------------

> Cudnn64.dll not found

This problem happens when the cuDNN library was not installed properly or a wrong version of cuDNN was used. Please download and install [cuDNN 7.0.5](https://developer.nvidia.com/cudnn) to address this problem.


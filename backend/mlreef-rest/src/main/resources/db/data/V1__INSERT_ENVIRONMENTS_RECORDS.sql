INSERT INTO public.base_environments ("id", "title", "docker_image", "description", "requirements", "machine_type",
                                      "sdk_version")
VALUES (E'870a0b67-f36b-40c8-9e76-560c32d5f3e8',
        E'Base environment tensorflow/tensorflow:2.1.0-gpu-py3',
        E'tensorflow/tensorflow:2.1.0-gpu-py3',
        E'GPU nvidia drivers and TF 2.1, compatible python 3.6-3.8',
        E'                                Ubuntu 20.04\n                                python 3.6.9\n                                tensorflow-gpu 2.1.0\n                                CUDA 10.1\n                                CUDNN 7',
        E'GPU', E'3.6.9');
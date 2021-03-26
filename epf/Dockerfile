FROM tensorflow/tensorflow:2.1.0-py3
# The above image does not contain cuda drivers, so it can be run inside container using docker run --gpus=all option 
#    from a container that contains nvidia driver
# If the image is being used as base image, it will need cuda drivers, then following image should be used
# FROM tensorflow/tensorflow:2.1.0-gpu-py3
MAINTAINER MLReef

ENV TENSORFLOW_VERSION 2.1.0

########## MLREEF ##########

RUN apt-get update                  && \
    apt-get install -y apt-utils    && \
    apt-get install --yes git       && \
    apt-get install -y wget         && \
    apt-get clean

##### ADD files to the image
WORKDIR /
ADD src /epf
ADD src/bin /bin
RUN chmod +x /bin -R


###### Setup Python and vergeml
WORKDIR /app
RUN apt-get update                                                                  
RUN apt-get install -y jq                                                                                                               
RUN rm -rf /var/lib/apt/lists/


RUN echo "------------------------------------------------------------------------" && \
    echo "                       MLREEF EPF: Setting Up"                            && \
    echo "------------------------------------------------------------------------" && \
    apt-get update                                                                  && \
    apt-get install -y libsm6  libfontconfig1 libxrender1                           && \
    python --version                                                                && \
    python -m pip install --upgrade --force pip                                     && \
    pip install virtualenv                                                          && \
    # Switch Python to virtualenv "venv"                                            && \
    virtualenv venv                                                                 && \
    # source venv/bin/activate                                                      && \
    pip install 'keras==2.3.0'                                                      && \
    pip install sklearn                                                             && \
    pip install pillow                                                              && \
    pip install scikit-learn                                                        && \
    pip install matplotlib                                                          && \
    pip install opencv-python                                                       && \
    pip install pandas                                                              && \
    pip install scikit-image


##### Run Tests
RUN cd /epf/tests                                                                   && \
    python3 -m pip install --upgrade pip                                            && \
    pip3 install -r requirements.txt                                                && \
    python3 -m unittest -v im_transformations_tests.Test                            && \
    echo "Tests successful"

## sentinel credentials
RUN echo "Sentinel hub credential set up"                                           && \
    sentinelhub.config --instance_id 'dac7e689-21fb-4f26-9835-64d74826b1c5'         && \
    sentinelhub.config --sh_client_id 'b85a3e06-e348-4446-b62e-7bc2ad5bb4f3'         && \
    sentinelhub.config --sh_client_secret '(zSc]ZZS8w(D3HKI3l<z^+N51P9Na0[I;~h/>X}_' && \
    sentinelhub.config --show


##### Add container startup script
CMD echo "------------------------------------"                                     && \
    echo "       MLREEF EPF Starting"                                               && \
    echo "------------------------------------"                                     && \
    cd /app 					                                                    && \
    python --version 			                                                	&& \
    ls -la /dev | grep nvidia                                                       && \
    nvidia-smi                                                                      


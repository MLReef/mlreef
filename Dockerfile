##### Base on python 3.7 image
#FROM python:3.7
FROM tensorflow/tensorflow:2.1.0-gpu-py3
MAINTAINER MLReef

ENV TENSORFLOW_VERSION 2.1.0

########## MLREEF ##########

##### ADD files to the image
WORKDIR /
ADD src /epf
ADD src/bin /bin


###### Setup Python and vergeml
WORKDIR /app
RUN apt-get update                                                                  
RUN apt-get install -y jq                                                                                                               
RUN rm -rf /var/lib/apt/lists/


RUN echo "------------------------------------------------------------------------" && \
    echo "                       MLREEF EPF: Setting Up"                            && \
    echo "------------------------------------------------------------------------" && \
    python --version                                                                && \
    python -m pip install --upgrade --force pip                                     && \
    pip install virtualenv                                                          && \
    # Switch Python to virtualenv "venv"                                            && \
    virtualenv venv                                                                 && \
    # source venv/bin/activate                                                      && \
    pip install 'keras==2.3.0'                                                      && \
    pip install sklearn                                                             && \
    pip install Pillow                                                              && \
    pip install scikit-learn                                                        && \
    pip install matplotlib                                                          && \
    pip install opencv-python                                                       && \
    pip install pandas



##### Add container startup script
CMD echo "------------------------------------"                                     && \
    echo "       MLREEF EPF Starting"                                               && \
    echo "------------------------------------"                                     && \
    cd /app 					                                                    && \
    python --version 			                                                	&& \
    ls -la /dev | grep nvidia                                                       && \
    nvidia-smi
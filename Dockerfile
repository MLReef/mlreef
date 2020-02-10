##### Base on python 3.7 image
FROM python:3.7
MAINTAINER MLReef

##### ADD files to the image
WORKDIR /
ADD src /epf
ADD src/bin /bin


###### Setup Python and vergeml
WORKDIR /app
RUN apt-get update                                                                  && \
    apt-get install -y jq                                                           && \
    rm -rf /var/lib/apt/lists/

RUN echo "------------------------------------------------------------------------" && \
    echo "                       MLREEF EPF: Setting Up"                            && \
    echo "------------------------------------------------------------------------" && \
    python --version                                                                && \
    pip3 --version                                                                  && \
    python -m pip install --upgrade --force pip                                     && \
    pip install virtualenv                                                          && \
    virtualenv venv                                                                 && \
    pip install --upgrade 'tensorflow==1.14.0'                                      && \
    pip install 'keras==2.2.4'                                                      && \
    pip install sklearn                                                             && \
    pip install Pillow                                                              && \
    pip install scikit-learn                                                        && \
    pip install matplotlib                                                          && \
    pip install opencv-python                                                       && \
    pip install pandas                                                              && \
    apt-get update && apt-get install -y jq

##### Add container startup script
CMD echo "------------------------------------"                                     && \
    echo "       MLREEF EPF Starting"                                               && \
    echo "------------------------------------"                                     && \
    cd /app                                                                         && \
    python --version                                                                && \
    pip3 --version

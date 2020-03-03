##### Base on python 3.7 image
FROM python:3.7
MAINTAINER MLReef

ENV PATH /usr/local/cuda/bin/:$PATH
ENV LD_LIBRARY_PATH /home/ubuntu/src/cntk/bindings/python/cntk/libs:/usr/local/cuda/lib64:/usr/local/lib:/usr/lib:/usr/local/cuda/extras/CUPTI/lib64:/usr/local/mpi/lib:
ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES compute,utility
LABEL com.nvidia.volumes.needed="nvidia_driver"

RUN echo "/usr/local/cuda/lib64" > /etc/ld.so.conf.d/cuda.conf && \
  ldconfig

##### ADD files to the image
WORKDIR /
ADD src /epf
ADD src/bin /bin


###### Setup Python and vergeml
WORKDIR /app
RUN apt-get update                                                                  && \
 apt-get install -y jq                                                              && \
 apt-get install -y apt-utils                                                       && \
 rm -rf /var/lib/apt/lists/


RUN echo "------------------------------------------------------------------------" && \
    echo "                       MLREEF EPF: Setting Up"                            && \
    echo "------------------------------------------------------------------------" && \
    python --version                                                                && \
    pip3 --version                                                                  && \
    python -m pip install --upgrade --force pip                                     && \
    pip install virtualenv                                                          && \
    # Switch Python to virtualenv "venv"                                            && \
    virtualenv venv                                                                 && \
    # source venv/bin/activate                                                      && \
    pip install --upgrade 'tensorflow'                                              && \
    pip install 'keras==2.3.0'                                                      && \
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
    cd /app 					                                                    && \
    python --version 			                                                	&& \
    pip3 --version                                                                  && \
    ls -la /dev | grep nvidia                                                       && \
    nvidia-smi
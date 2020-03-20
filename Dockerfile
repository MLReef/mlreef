##### Base on python 3.7 image
#FROM python:3.7
FROM ubuntu:16.04
MAINTAINER MLReef

ENV CUDA_VERSION 10.1
ENV CUDA_VERSION_FULL ${CUDA_VERSION}.243
# CUDA VERSION 10-0=10.0.130-1
ENV CUDA_PKG_VERSION 10-1=$CUDA_VERSION_FULL"-1"
ENV TENSORFLOW_VERSION 2.1.0
ENV KERAS_VERSION 2.3.0


ENV PATH ${PATH}:/usr/local/cuda/bin:/usr/local/nvidia/bin

# nvidia-container-runtime
ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES compute,utility
ENV NVIDIA_REQUIRE_CUDA "cuda>=${CUDA_VERSION} brand=tesla,driver>=384,driver<385 brand=tesla,driver>=410,driver<411"

LABEL com.nvidia.volumes.needed="nvidia_driver"


RUN apt-get update                                                                                                      && \
    apt-get install -y apt-utils                                                                                        && \
    apt-get install --yes git python3-dev python3-pip                                                                   && \
    rm -rf /var/lib/apt/lists/*                                                                                         && \
    cd /usr/local/bin                                                                                                   && \
    ln -s /usr/bin/python3 python                                                                                       && \
    pip3 install --upgrade pip


RUN apt-get update                                                                                                      && \
    apt-get install -y --no-install-recommends ca-certificates apt-transport-https gnupg-curl                           && \
    rm -rf /var/lib/apt/lists/*                                                                                         && \
    NVIDIA_GPGKEY_SUM=d1be581509378368edeec8c1eb2958702feedf3bc3d17011adbf24efacce4ab5                                  && \
    NVIDIA_GPGKEY_FPR=ae09fe4bbd223a84b2ccfce3f60f4b3d7fa2af80                                                          && \
    apt-key adv --fetch-keys https://developer.download.nvidia.com/compute/cuda/repos/ubuntu1604/x86_64/7fa2af80.pub    && \
    apt-key adv --export --no-emit-version -a $NVIDIA_GPGKEY_FPR | tail -n +5 > cudasign.pub                            && \
    echo "$NVIDIA_GPGKEY_SUM  cudasign.pub" | sha256sum -c --strict - && rm cudasign.pub                                && \
    echo "deb http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1604/x86_64 /" > /etc/apt/sources.list.d/cuda.list && \
    echo "deb http://developer.download.nvidia.com/compute/machine-learning/repos/ubuntu1604/x86_64 /" > /etc/apt/sources.list.d/nvidia-ml.list


# For libraries in the cuda-compat-* package: https://docs.nvidia.com/cuda/eula/index.html#attachment-a
RUN apt-get update                                                                                                      && \
    apt-get install -y --no-install-recommends cuda-cudart-$CUDA_PKG_VERSION cuda-compat-${CUDA_VERSION}                && \
    rm -rf /var/lib/apt/lists/*                                                                                         && \
    ln -s cuda-${CUDA_VERSION} /usr/local/cuda


ENV LD_LIBRARY_PATH ${LD_LIBRARY_PATH}:/usr/lib:/usr/local/lib:/usr/local/mpi/lib:/usr/local/cuda/lib64
ENV LD_LIBRARY_PATH ${LD_LIBRARY_PATH}:/usr/local/nvidia/lib:/usr/local/nvidia/lib64
#ENV LD_LIBRARY_PATH ${LD_LIBRARY_PATH}:/usr/local/cuda-${CUDA_VERSION}/lib64:/usr/local/cuda/extras/CUPTI/lib64
ENV LD_LIBRARY_PATH ${LD_LIBRARY_PATH}:/home/ubuntu/src/cntk/bindings/python/cntk/libs

RUN echo "/usr/local/nvidia/lib" >> /etc/ld.so.conf.d/nvidia.conf                                                       && \
    echo "/usr/local/nvidia/lib64" >> /etc/ld.so.conf.d/nvidia.conf

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
    python3 --version                                                               && \
    pip3 --version                                                                  && \
    python3 -m pip install --upgrade --force pip                                    && \
    pip install virtualenv                                                          && \
    # Switch Python to virtualenv "venv"                                            && \
    virtualenv venv                                                                 && \
    # source venv/bin/activate                                                      && \
    pip install 'tensorflow=='${TENSORFLOW_VERSION}                                 && \
    pip install 'keras=='${KERAS_VERSION}                                           && \
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
    python3 --version 			                                                	&& \
    pip3 --version                                                                  && \
    ls -la /dev | grep nvidia                                                       && \
    nvidia-smi
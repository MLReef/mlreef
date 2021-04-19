FROM registry.gitlab.com/mlreef/devops/ubuntu-nvidia-dind/ubuntu-nvidia-dind-base:10.1
MAINTAINER MLReef

########## MLREEF ##########

RUN apt update  && \
    apt install -y \
    git  \
    curl \
    wget \
    jq   \
    psmisc \
    inotify-tools && \
    ## For bug https://github.com/NVIDIA/nvidia-docker/issues/1163
    sed -i 's/@\/sbin/\/sbin/g' /etc/nvidia-container-runtime/config.toml  


##### ADD files to the image
WORKDIR /
ADD src/bin /bin
RUN chmod +x /bin -R


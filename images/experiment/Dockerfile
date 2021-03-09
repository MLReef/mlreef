FROM registry.gitlab.com/mlreef/devops/k8s-images/ubuntu-nvidia-dind:latest
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


#!/bin/bash

LOG="/root/startup.log"
INIT_ZIP="mlreef-data-develop.zip"       # see backup.sh
S3_BUCKET_NAME="mlreef-application-data" # see backup.sh

touch $LOG
chmod 777 $LOG

{
  echo "Installing ZIP"
  apt install zip unzip

  echo "Mounting data folder: /data "
  # mount second block device; see: block-device-mappings.json
  # fdisk -l
  mkfs.ext4 /dev/xvdb
  mkdir /data
  mount /dev/xvdb /data

  echo "Installing Docker"
  wget -qO- https://get.docker.com/ | sh
  curl -L https://github.com/docker/compose/releases/download/v1.25.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose

} >>$LOG


{
  echo "Downloading Gitlab Database"
  docker run --name=systemkern-s5-shell-alias-container --rm --tty  \
    --volume ${HOME}:/root                                          \
    --volume ${PWD}:/app                                            \
    -e AWS_ACCESS_KEY_ID=XXXXX                                      \
    -e AWS_SECRET_ACCESS_KEY=XXXXX                                  \
    -e AWS_DEFAULT_REGION=eu-central-1                              \
    registry.gitlab.com/systemkern/s5:latest-aws                    \
    aws s3 cp s3://$S3_BUCKET_NAME/$INIT_ZIP .

  echo "Unzipping $INIT_ZIP to /data"
  ls -la /$INIT_ZIP
  unzip /$INIT_ZIP -d /data > /dev/null
  echo "Init data unzipped:"
  ls -la /data
  chown -R ubuntu:ubuntu /data/*
} >>$LOG


# Install nvidia-docker and nvidia-docker-plugin
# https://github.com/NVIDIA/nvidia-docker
# https://github.com/NVIDIA/nvidia-docker#ubuntu-16041804-debian-jessiestretchbuster
# https://github.com/NVIDIA/nvidia-docker/wiki/Frequently-Asked-Questions#how-do-i-install-the-nvidia-driver
# https://github.com/NVIDIA/nvidia-container-runtime#docker-engine-setup
# https://github.com/flx42/nvidia-docker/#centos-7-docker-rhel-7475-docker
# https://github.com/docker/compose/issues/6691
# https://devtalk.nvidia.com/default/topic/1061452/could-not-select-device-driver-quot-quot-with-capabilities-gpu-/
# use this command to test the installation
# docker run --gpus all nvidia/cuda:9.0-base nvidia-sm
#
# This script currently installs nvidia-docker, cuda drivers and the nvidia-container-toolkit.
# Since nvidia-docker-2 has already been released the installation method should also be modified.
echo "Installing NVIDIA Drivers"                            >>$LOG

apt-key adv --fetch-keys http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1604/x86_64/7fa2af80.pub
echo "deb http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1604/x86_64 /" >/etc/apt/sources.list.d/cuda.list
apt-get update && sudo apt-get install -y --no-install-recommends linux-headers-generic dkms cuda-drivers
wget -P /tmp https://github.com/NVIDIA/nvidia-docker/releases/download/v1.0.1/nvidia-docker_1.0.1-1_amd64.deb
dpkg -i /tmp/nvidia-docker*.deb && rm /tmp/nvidia-docker*.deb

distribution=$(
  . /etc/os-release
  echo $ID$VERSION_ID
)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list >/etc/apt/sources.list.d/nvidia-docker.list

apt-get update && sudo apt-get install -y nvidia-container-toolkit
apt-get install nvidia-container-runtime
tee /etc/docker/daemon.json <<EOF
{
  "graph": "/data/docker",
  "runtimes": {
    "nvidia": {
      "path": "/usr/bin/nvidia-container-runtime",
      "runtimeArgs": []
    }
  }
}
EOF
# restart docker to finish gpu installation

echo "NVIDIA drivers installed ... restarting docker service" >>$LOG
systemctl restart docker

echo "Caching images" >>$LOG

# Pull the used Docker images already during startup, this will speed up the deployment phase
docker pull sameersbn/gitlab:12.4.0
docker pull gitlab/gitlab-runner:alpine
docker pull sameersbn/postgresql:10-2
docker pull sameersbn/redis:4.0.9-2

echo "done" >>$LOG

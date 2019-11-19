#!/bin/bash

LOG="/root/startup.log"
sudo touch $LOG
sudo chmod 777 $LOG
sudo apt install zip unzip

echo "Preparing Gitlab data folder: /data " >> $LOG
# mount second block device; see: block-device-mappings.json
# sudo fdisk -l
sudo mkfs.ext4 /dev/xvdb
sudo mkdir /data
sudo mount /dev/xvdb /data

echo "Copying Gitlab Database" >> $LOG
#download the database dump
INIT_ZIP="gitlab-init.zip"
sudo wget https://gitlab.com/mlreef/frontend/raw/master/bin/$INIT_ZIP -P /root
sudo unzip -d /data /root/$INIT_ZIP

echo "Installing Docker" >> $LOG
wget -qO- https://get.docker.com/ | sh
sudo apt install -y docker-compose

export GITLAB_SECRETS_SECRET_KEY_BASE="1111111111122222222222333333333334444444444555555555566666666661234"
export    GITLAB_SECRETS_OTP_KEY_BASE="1111111111122222222222333333333334444444444555555555566666666661234"
export     GITLAB_SECRETS_DB_KEY_BASE="1111111111122222222222333333333334444444444555555555566666666661234"

sudo docker pull sameersbn/gitlab:12.4.0     | tee -a $LOG
sudo docker pull gitlab/gitlab-runner:alpine | tee -a $LOG
sudo docker pull sameersbn/postgresql:10-2   | tee -a $LOG
sudo docker pull sameersbn/redis:4.0.9-2     | tee -a $LOG

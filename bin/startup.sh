#!/bin/bash

sudo apt install zip unzip


# mount second block device; see: block-device-mappings.json
# sudo fdisk -l
sudo mkfs.ext4 /dev/xvdb
sudo mkdir /data
sudo mount /dev/xvdb /data

#download the database dump
INIT_ZIP="gitlab-init.zip"
sudo wget https://gitlab.com/mlreef/frontend/raw/master/bin/$INIT_ZIP -P /root
sudo unzip -d /data /root/$INIT_ZIP


wget -qO- https://get.docker.com/ | sh
sudo apt install -y docker-compose
#sudo apt install -y postgresql-client-common
#sudo apt install -y postgresql-client-9.5
#pg_dump -U gitlab password > dbexport.pgsql


export GITLAB_SECRETS_SECRET_KEY_BASE="1111111111122222222222333333333334444444444555555555566666666661234"
export    GITLAB_SECRETS_OTP_KEY_BASE="1111111111122222222222333333333334444444444555555555566666666661234"
export     GITLAB_SECRETS_DB_KEY_BASE="1111111111122222222222333333333334444444444555555555566666666661234"

touch docker-compose.yml
chmod 777 docker-compose.yml


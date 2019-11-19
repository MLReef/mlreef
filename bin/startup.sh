#!/bin/bash

LOG="/root/startup.log"
sudo touch $LOG
sudo chmod 777 $LOG
sudo apt install zip unzip

echo "Preparing Gitlab data folder: /data " >> $LOG
# mount second block device; see: block-device-mappings.json
# sudo fdisk -l
mkfs.ext4 /dev/xvdb
mkdir /data
mount /dev/xvdb /data

INIT_ZIP="mlreef-data-develop.zip"
S3_BUCKET_NAME="mlreef-data"

echo "Installing Docker" >> $LOG
wget -qO- https://get.docker.com/ | sh
sudo apt install -y docker-compose

echo "Downloading Gitlab Database" >> $LOG
docker run --name=systemkern-s5-shell-alias-container --rm --tty \
  --volume ${HOME}:/root                        \
  --volume ${PWD}:/app                          \
  -e AWS_ACCESS_KEY_ID=XXXXX                    \
  -e AWS_SECRET_ACCESS_KEY=XXXXX                \
  -e AWS_DEFAULT_REGION=eu-central-1            \
  registry.gitlab.com/systemkern/s5:latest-aws  \
  aws s3 cp s3://$S3_BUCKET_NAME/$INIT_ZIP .  \
  >> $LOG

ls -la /$INIT_ZIP >> $LOG

echo "Unzipping $INIT_ZIP to /data" >> $LOG
unzip /$INIT_ZIP -d /data
echo "Init data unzipped:" >> $LOG
ls -la /data >> $LOG

export GITLAB_SECRETS_SECRET_KEY_BASE="1111111111122222222222333333333334444444444555555555566666666661234"
export    GITLAB_SECRETS_OTP_KEY_BASE="1111111111122222222222333333333334444444444555555555566666666661234"
export     GITLAB_SECRETS_DB_KEY_BASE="1111111111122222222222333333333334444444444555555555566666666661234"

docker pull sameersbn/gitlab:12.4.0      # >> $LOG
docker pull gitlab/gitlab-runner:alpine  # >> $LOG
docker pull sameersbn/postgresql:10-2    # >> $LOG
docker pull sameersbn/redis:4.0.9-2      # >> $LOG

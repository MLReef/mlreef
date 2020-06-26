#!/bin/bash

LOG="/root/startup.log"
LOCK="/root/installation.lock"
INIT_ZIP="mlreef-data-develop.zip"       # see backup.sh
S3_BUCKET_NAME="mlreef-application-data" # see backup.sh

touch $LOG
chmod 777 $LOG
touch $LOCK

{
  echo "### 1. Install Docker Compose"
  curl -L https://github.com/docker/compose/releases/download/v1.25.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose

  echo "### 2. Mount data folder: /data "
  # mount second block device; see: block-device-mappings.json
  # fdisk -l
  mkfs.ext4 /dev/xvdb
  mkdir /data
  mount /dev/xvdb /data

  echo "### 3. Install ZIP"
  apt install zip unzip

  echo "### 4. Download Gitlab Database"
  docker run --name=systemkern-s5-shell-alias-container --rm --tty \
    --volume ${HOME}:/root \
    --volume ${PWD}:/app \
    -e AWS_ACCESS_KEY_ID=XXXXX \
    -e AWS_SECRET_ACCESS_KEY=XXXXX \
    -e AWS_DEFAULT_REGION=eu-central-1 \
    registry.gitlab.com/systemkern/s5:latest-aws \
    aws s3 cp s3://$S3_BUCKET_NAME/$INIT_ZIP .

  echo "### 5. Unzipp $INIT_ZIP to /data"
  ls -la /$INIT_ZIP
  unzip /$INIT_ZIP -d /data >/dev/null
  echo "Init data unzipped:"
  ls -la /data
  chown -R ubuntu:ubuntu /data/*
} >>$LOG

rm -rf $LOCK

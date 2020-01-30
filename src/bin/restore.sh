#!/bin/sh
set -e
set -x


INIT_ZIP=mlreef-data-develop.zip                           # see startup.sh
S3_BUCKET_NAME="mlreef-data"                               # see startup.sh

alias remote-ec2="ssh -i development_deployment.pem -o 'AddKeysToAgent yes' ubuntu@\${INSTANCE} "

if [ "$1" = "" ]; then
  echo "Missing instance url"
  exit 1
fi

INSTANCE=$1

echo "starting backup script"
echo "----------------------------------------"
echo "The EC2 instance is: $INSTANCE"

ssh-keyscan -H "$INSTANCE" >>~/.ssh/known_hosts

remote-ec2 "sudo docker-compose down"

remote-ec2 "sudo docker run --name=systemkern-s5-shell-alias-container --rm --tty \
  --volume ${HOME}:/root                         \
  --volume ${PWD}:/app                           \
  -e AWS_ACCESS_KEY_ID=XXXXX                     \
  -e AWS_SECRET_ACCESS_KEY=XXXXX                 \
  -e AWS_DEFAULT_REGION=eu-central-1             \
  registry.gitlab.com/systemkern/s5:latest-aws   \
  aws s3 cp s3://$S3_BUCKET_NAME/$INIT_ZIP /root/$INIT_ZIP"

remote-ec2 "sudo rm -rf /data/*"
remote-ec2 "sudo unzip /root/$INIT_ZIP -d /data"
remote-ec2 "sudo chown -R ubuntu:ubuntu /data/*"
remote-ec2 "sudo docker-compose up -d"

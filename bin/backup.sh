#!/bin/sh
set -e
set -x

INIT_ZIP=mlreef-data-develop.zip                           # see startup.sh
S3_BUCKET_NAME="mlreef-application-data"                   # see startup.sh

alias remote-ec2="ssh -i development_deployment.pem -o 'AddKeysToAgent yes' ubuntu@\${INSTANCE} "

while [ -n "$1" ]; do
  case "$1" in
  -i | --instance) INSTANCE="$2"
    echo "Connecting to ec2 instance $INSTANCE"
    shift ;;
  -b | --bucket) S3_BUCKET_NAME="$2"
    echo "Using Amazon s3 bucket: $S3_BUCKET_NAME"
    shift ;;
  -f | --file) INIT_ZIP="$2"
    echo "Using file name: $INIT_ZIP"
    shift ;;
  *) echo "Option $1 not recognized" ;;
  esac
  shift
done

if [ "$INSTANCE" = "" ]; then
  echo "Missing instance url. use the -i or --instance option"
  exit 1
fi


echo "starting backup script"
echo "----------------------------------------"

ssh-keyscan -H "$INSTANCE" >>~/.ssh/known_hosts

remote-ec2 "sudo docker-compose down"
remote-ec2 "sudo rm /root/$INIT_ZIP || true"
remote-ec2 "cd /data && sudo zip -r /root/$INIT_ZIP ."
remote-ec2 "sudo docker run --name=systemkern-s5-shell-alias-container --rm --tty \
  --volume ${HOME}:/root                         \
  --volume ${PWD}:/app                           \
  -e AWS_ACCESS_KEY_ID=XXXXX                     \
  -e AWS_SECRET_ACCESS_KEY=XXXXX                 \
  -e AWS_DEFAULT_REGION=eu-central-1             \
  registry.gitlab.com/systemkern/s5:latest-aws   \
  aws s3 cp /root/$INIT_ZIP s3://$S3_BUCKET_NAME/$INIT_ZIP"
remote-ec2 "sudo docker-compose up -d"

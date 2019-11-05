#!/bin/sh
set -e

if [ "$1" = "" ]; then
  INCR=$(date +"%H%M")
else
  INCR="_$1"
fi
echo "The increment is $INCR"

 rm deploy.zip | true
 rm -rf web/build | true
 rm -rf web/node_modules | true
 rm -rf web/pakage-lock.json | true
 cd web
 zip -qr deploy.zip .
 cd ..

export AWS_DEFAULT_REGION="eu-central-1"
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""
export DOCKER_IMAGE="registry.gitlab.com/systemkern/s5:nightly-aws"
export EC2_INSTANCE_NAME="node-test-instance_$INCR"     # environment name and url are set separately
export EC2_IMAGE_AMI="ami-03c87d96f6702a119"            # aws-elasticbeanstalk-amzn-2018.03.0.x86_64-nodejs-hvm-201904170656
export EC2_MACHINE_SIZE="t2.micro"
export EC2_SECURITY_GRP="application_servers"

echo "Terminating existing $EC2_INSTANCE_NAME instances"
docker run --rm  \
  --tty                     \
  --volume "$HOME":/root    \
  --volume "$PWD":/app      \
  -e AWS_DEFAULT_REGION     \
  -e AWS_ACCESS_KEY_ID      \
  -e AWS_SECRET_ACCESS_KEY  \
  -e EC2_INSTANCE_NAME      \
  $DOCKER_IMAGE             \
  ./bin/decomission.sh

echo "Starting EC2 instance $EC2_INSTANCE_NAME"
INSTANCE=$(docker run --rm  \
  --tty                     \
  --volume "$HOME":/root    \
  --volume "$PWD":/app      \
  -e AWS_DEFAULT_REGION     \
  -e AWS_ACCESS_KEY_ID      \
  -e AWS_SECRET_ACCESS_KEY  \
  -e EC2_INSTANCE_NAME      \
  -e EC2_IMAGE_AMI          \
  -e EC2_MACHINE_SIZE       \
  -e EC2_SECURITY_GRP       \
  $DOCKER_IMAGE             \
  ./bin/provision-frontend.sh)

INSTANCE=$(echo "$INSTANCE" | tr -d '\r')

echo "waiting for $INSTANCE to boot …"
sleep 120
echo "… continuing"

./bin/deploy.sh "$INSTANCE"
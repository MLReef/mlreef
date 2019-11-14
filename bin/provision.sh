#!/bin/sh
set -e

if [ -n "$1" ]; then
    EC2_INSTANCE_NAME=$1
fi

if [ -n "$2" ]; then
    STARTUP_SCRIPT=$2
fi

# aws ec2 run instances documentation
# https://docs.aws.amazon.com/cli/latest/reference/ec2/run-instances.html
INSTANCE_ID=$(aws ec2 run-instances --count 1 \
  --region ${AWS_DEFAULT_REGION}              \
  --image-id ${EC2_IMAGE_AMI}                 \
  --instance-type ${EC2_MACHINE_SIZE}         \
  --security-groups ${EC2_SECURITY_GRP}       \
  --key-name development_deployment           \
  --user-data file://"${STARTUP_SCRIPT}"      \
  --block-device-mappings file://bin/block-device-mappings.json \
 | jq -r ".Instances[].InstanceId")

aws ec2 create-tags                             \
  --tags "Key=Name,Value=${EC2_INSTANCE_NAME}"  \
  --resources "$INSTANCE_ID"

SERVER=$(aws ec2 describe-instances                    \
  --filters "Name=instance-id,Values=$INSTANCE_ID"     \
 | jq -r ".Reservations[].Instances[].NetworkInterfaces[].Association.PublicDnsName")

# Apparently this echo is necessary to properly pipe the output out of a docker run command
echo "$SERVER" | tr -d '\r'

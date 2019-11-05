#!/bin/sh
set -e

if [ -n "$1" ]; then
    EC2_INSTANCE_NAME=$1
fi

#export EC2_IMAGE_AMI="ami-0ac05733838eabc06"      # ubuntu/images/hvm-ssd/ubuntu-bionic-18.04-amd64-server-20190722.1
#export EC2_IMAGE_AMI="ami-0226a38317e2aca0d"      # Amazon Linux 2 AMI (HVM)
#export EC2_IMAGE_AMI="ami-010fae13a16763bb4"      # Amazon Linux AMI 2018.03.0 (HVM)

INSTANCE_ID=$(aws ec2 run-instances --count 1 \
  --region ${AWS_DEFAULT_REGION}              \
  --image-id ${EC2_IMAGE_AMI}                 \
  --instance-type ${EC2_MACHINE_SIZE}         \
  --security-groups ${EC2_SECURITY_GRP}       \
  --key-name development_deployment           \
  --user-data file://bin/ec2-startup.sh       \
 | jq -r ".Instances[].InstanceId")

#  --tags "Key=Name,Value=${EC2_INSTANCE_NAME}" \

aws ec2 create-tags                             \
  --tags "Key=Name,Value=${EC2_INSTANCE_NAME}"  \
  --resources "$INSTANCE_ID"


SERVER=$(aws ec2 describe-instances                    \
  --filters "Name=instance-id,Values=$INSTANCE_ID"     \
 | jq -r ".Reservations[].Instances[].NetworkInterfaces[].Association.PublicDnsName")

# Apparently this echo is necessry to properly pipe the output out of a docker run command
echo "$SERVER" | tr -d '\r'

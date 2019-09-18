#!/bin/sh
set -e


#export EC2_IMAGE_AMI="ami-0ac05733838eabc06"      # ubuntu/images/hvm-ssd/ubuntu-bionic-18.04-amd64-server-20190722.1
#export EC2_IMAGE_AMI="ami-0226a38317e2aca0d"      # Amazon Linux 2 AMI (HVM)
#export EC2_IMAGE_AMI="ami-010fae13a16763bb4"      # Amazon Linux AMI 2018.03.0 (HVM)

aws ec2 describe-instances                              \
  --filters "Name=tag:Name,Values=$EC2_INSTANCE_NAME"   \
  | jq -r ".Reservations[].Instances[].InstanceId"      \
  | xargs --no-run-if-empty aws ec2 terminate-instances \
  --instance-id

#!/bin/bash
# shellcheck disable=SC2155   # Declare and assign separately to avoid masking return values. See SC2155.

# change to the repository root folder via the scripts location
cd "$(dirname "$0")"/../..
. bin/includes/log
. bin/includes/detect-os
. bin/includes/ci-environment
. bin/includes/test-environment
########################################
set -x    # output all commands
set -o    pipefail
set -e    # exit on immediately on every error
set -u    # error on usage of undefined variables
########################################


#URL = ec2-18-195-30-163.eu-central-1.compute.amazonaws.com

echo "TEST Frontend is reachable:"
curl "http://$INSTANCE_HOST/login" --output /dev/null

echo "TEST Gitlab is reachable:"
curl "http://$INSTANCE_HOST/api/v4/projects" --output /dev/null

echo "TEST Backend is reachable:"
curl "http://$INSTANCE_HOST:8080/api/v1/info/status"  | jq

echo "TEST Backend is healthy and gitlab connection works:"
curl "http://$INSTANCE_HOST:8080/api/v1/info/health"  | jq

#"2020-08-24T12:24:58.714Z"
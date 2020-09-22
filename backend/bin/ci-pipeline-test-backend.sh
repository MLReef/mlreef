#!/bin/bash
cd "$(dirname "$0")"/../..
. bin/includes/log
. bin/includes/detect-os
. bin/includes/ci-environment
. bin/includes/ci-test-base
set -x # output all commands
set -e # exit on immediately on every error
set -u # error on usage of undefined variables
if [ ! -e backend/build.gradle ]; then exit 1; fi
cd backend

export GITLAB_ROOT_URL="http://$INSTANCE_HOST:10080"
export MLREEF_BACKEND_URL="http://$INSTANCE_HOST:8080"

echo "# SYSTEM TEST ENVIRONMENT"
echo "   EC2_INSTANCE_NAME = $EC2_INSTANCE_NAME"
echo "  CI_COMMIT_REF_SLUG = $CI_COMMIT_REF_SLUG"
echo " Target instance     = $INSTANCE_HOST"
echo "  MLREEF_BACKEND_URL    = $MLREEF_BACKEND_URL"
echo "  GITLAB_ROOT_URL       = $GITLAB_ROOT_URL"

export GRADLE_USER_HOME=$(pwd)/.gradle
./gradlew :mlreef-system-test:pipelineTest

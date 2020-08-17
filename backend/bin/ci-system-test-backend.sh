#!/bin/bash
# change to the repository root folder via the scripts location
cd "$(dirname "$0")"/../..
. bin/includes/log
. bin/includes/detect-os
. bin/includes/ci-environment
. bin/includes/ci-test-base
########################################
set -x    # output all commands
set -e    # exit on immediately on every error
set -u    # error on usage of undefined variables
########################################


# ensure that there exists a gradle configuration
if [ ! -e backend/build.gradle ]; then exit 1; fi

cd backend

export DB_HOST=postgres
export DB_NAME=mlreef_backend
export DB_PASSWORD=password
export DB_PORT=5432
export DB_USER=postgres

export REDIS_HOST="redis"
export REDIS_PORT=6379
export POSTGRES_DB=$DB_NAME
export POSTGRES_USER=$DB_USER
export POSTGRES_PASSWORD=$DB_PASSWORD
export DOCKER_HOST="tcp://docker:2375"  # gitlab needs this to support docker testcontainers
export DOCKER_DRIVER=overlay2           # gitlab needs this to support docker testcontainers
export DOCKER_TLS_CERTDIR=""            # "/certs" gitlab needs this to support docker testcontainers

export GITLAB_ROOT_URL="$URL:10080"
export MLREEF_BACKEND_URL="$URL:8080"

echo "# SYSTEM TEST ENVIRONMENT"
echo "   EC2_INSTANCE_NAME = $EC2_INSTANCE_NAME"
echo "  CI_COMMIT_REF_SLUG = $CI_COMMIT_REF_SLUG"
echo " Target instance URL = $URL"
echo " "
echo "  MLREEF_BACKEND_URL    = $MLREEF_BACKEND_URL"
echo "  GITLAB_ROOT_URL       = $GITLAB_ROOT_URL"

# do no show; or mask it
#echo "  GITLAB_ADMIN_TOKEN    = $GITLAB_ADMIN_TOKEN"

# currently not set! and *currently* no used..
#echo "  GITLAB_ADMIN_USERNAME = $GITLAB_ADMIN_USERNAME"
#echo "  GITLAB_ADMIN_PASSWORD = $GITLAB_ADMIN_PASSWORD"

export GRADLE_USER_HOME=$(pwd)/.gradle
./gradlew :mlreef-system-test:systemTest
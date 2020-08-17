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

echo "HOST is $URL"
echo "URL is http://$URL"

echo "TEST Frontend is reachable:"
curl "http://$URL/login" --output /dev/null

echo "TEST Gitlab is reachable:"
curl "http://$URL/api/v4/projects" --output /dev/null

echo "TEST Backend is reachable:"
curl "http://$URL:8080/api/v1/info/status"  | jq

echo "TEST Backend is healthy and gitlab connection works:"
curl "http://$URL:8080/api/v1/info/health"  | jq


mkdir -p out/test/
echo "SMOKE-TEST-$(randomString 3)" > out/test/user.tmp
echo "password" > out/test/password.tmp
export USER=$(cat out/test/user.tmp)
export PASSWORD=$(cat out/test/password.tmp)
log "Username is $USER with password "
export TOKEN #declare separately to be able to gather return value

if [ $(curl --silent --output /dev/null -w ''%{http_code}'' "http://$URL/api/v4/projects") != 200 ]; then
  curl $URL/api/v4/projects
  exit 1;
fi

curl "http://$URL:8080/api/v1/auth/register"  \
  --request POST --show-error                 \
  --header 'Content-Type: application/json'   \
  --header 'Accept: application/json'         \
  --data '{
    "username" : "'"$USER"'",
    "email" : "'"$USER"'@example.com",
    "password" : "'"$PASSWORD"'",
    "name" : "Smoke Test User '"$USER"'"
    }'                                        \
    | jq                                      \
    | tee out/test/register.response.tmp

jq -r ".token" < out/test/register.response.tmp > out/test/token.tmp
export TOKEN="$(cat out/test/token.tmp)"
if [ "$TOKEN" = "" ]; then
  echo >&2 "ERROR: TOKEN is empty."
  cat out/test/token.tmp
  cat out/test/register.response.tmp
  exit 1
fi

log "Registering exited with $? and produced token $TOKEN"

curl "http://$URL:8080/api/v1/data-projects" -X POST \
  --request POST --show-error                 \
  --header "PRIVATE-TOKEN: $TOKEN"            \
  --header "Content-Type: application/json"   \
  --header "Accept: application/json"         \
  --data '{
    "slug" : "test-project",
    "namespace" : "'$USER'",
    "name" : "Test project '$USER'",
    "description" : "description",
    "initialize_with_readme" : true,
    "visibility" : "PUBLIC"
  }'                                          \
  | jq                                        \
  | tee out/test/create-data-project.response.json

jq < out/test/create-data-project.response.json

jq -r ".id" < out/test/create-data-project.response.json > out/test/project-id.tmp
export PROJECT_ID=$(cat out/test/project-id.tmp)
echo "Project_ID=$PROJECT_ID"
if [ "$PROJECT_ID" = "" ]; then
  echo >&2 "ERROR: PROJECT_ID is empty."
  cat out/test/create-data-project.response.json
  cat out/test/project-id.tmp
  exit 1
fi


jq -r ".gitlab_id" < out/test/create-data-project.response.json > out/test/gitlab-project-id.tmp
export GITLAB_PROJECT_ID=$(cat out/test/gitlab-project-id.tmp)
if [ "$GITLAB_PROJECT_ID" = "" ]; then
  echo >&2 "ERROR: GITLAB_PROJECT_ID is empty."
  cat out/test/create-data-project.response.json
  cat out/test/gitlab-project-id.tmp
  exit 1
fi

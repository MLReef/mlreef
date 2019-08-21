#!/usr/bin/env bash -e
# shellcheck disable=SC2096

# prepare environment, see ../gitlab-ci.yml
export IMAGE_NAME="epf"
export DOCKER_REGISTRY="registry.gitlab.com"
export DOCKER_ORGANISATION="mlreef"

export TAG="nightly"
export IMAGE_PATH="${DOCKER_REGISTRY}/${DOCKER_ORGANISATION}/${IMAGE_NAME}:${TAG}"

bin/build.sh

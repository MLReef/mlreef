#!/usr/bin/env bash -e
# shellcheck disable=SC2096

# prepare environment, see ../gitlab-ci.yml
export DEV_NAME="epf"
export IMAGE_NAME="mlreef-epf"
export DOCKER_HUB_ORGANISATION="camillopachmann"
export TAG="nightly"
export IMAGE_PATH="${DOCKER_HUB_ORGANISATION}/${IMAGE_NAME}:${TAG}"

bin/build.sh

# test run image (mainly for log output)
docker run --name="$IMAGE_NAME-container" "$IMAGE_NAME"

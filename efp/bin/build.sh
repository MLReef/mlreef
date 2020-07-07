#!/usr/bin/env bash -e
# shellcheck disable=SC2096

# prepare environment, see ../gitlab-ci.yml
export IMAGE_NAME="epf"
export DOCKER_REGISTRY="registry.gitlab.com"
export DOCKER_ORGANISATION="mlreef"

export TAG="nightly"
export IMAGE_PATH="${DOCKER_REGISTRY}/${DOCKER_ORGANISATION}/${IMAGE_NAME}:${TAG}"

# build with default name to not spam developer machines
# for faster developer builds build without --pull
docker build --quiet --tag "$IMAGE_PATH" -f Dockerfile .

docker rm "mlreef-$IMAGE_NAME-container" || true

# test run image (mainly for log output)
docker run --name="mlreef-$IMAGE_NAME-container" "$IMAGE_NAME"

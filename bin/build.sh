#!/bin/sh

echo "IMAGE_PATH: $IMAGE_PATH"

docker rm "mlreef-$IMAGE_NAME-container" || true

# build with default name to not spam developer machines
# for faster developer builds build without --pull
docker build --pull --tag "$IMAGE_NAME" .

docker tag "$IMAGE_NAME" "$IMAGE_PATH"

# test run image (mainly for log output)
docker run --name="mlreef-$IMAGE_NAME-container" "$IMAGE_NAME"

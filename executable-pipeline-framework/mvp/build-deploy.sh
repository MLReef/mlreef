#!/usr/bin/env bash -e

docker rm eps-container || true

docker build -t eps .

docker run --name=eps-container eps

#docker tag rainerkern/mlreef-eps:latest
docker tag eps mlreef/ml_pipeline:latest

#docker push rainerkern/mlreef-eps:latest
docker push mlreef/ml_pipeline:latest

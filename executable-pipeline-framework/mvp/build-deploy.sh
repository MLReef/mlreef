#!/usr/bin/env bash -e

docker rm eps-container || true

docker build -t eps .

docker run --name=eps-container eps

docker tag eps rainerkern/mlreef-eps:latest

docker push rainerkern/mlreef-eps:latest

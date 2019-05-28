#!/usr/bin/env bash

docker rm eps-container

docker build -t eps .

docker run --name=eps-container eps

docker tag eps rainerkern/mlreef-eps:latest

docker push rainerkern/mlreef-eps:latest
#!/usr/bin/env bash -e

docker rm eps-java-container || true

docker build -t eps-java .

docker run --name=eps-java-container eps-java

docker tag eps rainerkern/mlreef-eps:latest-java8-kotlin

docker push rainerkern/mlreef-eps:latest-java8-kotlin

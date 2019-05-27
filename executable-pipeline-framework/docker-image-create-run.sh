#!/usr/bin/env bash

docker rm eps-container

docker build -t eps .

docker run --name=eps-container eps
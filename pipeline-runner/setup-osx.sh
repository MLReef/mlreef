#!/usr/bin/env bash

docker run -d --name gitlab-runner-config --restart always \
   -v /Users/Shared/gitlab-runner-config/config:/etc/gitlab-runner \
   -v /var/run/docker.sock:/var/run/docker.sock \
   gitlab/gitlab-runner:latest

docker run -d --name gitlab-runner --restart always \
     -v /var/run/docker.sock:/var/run/docker.sock \
     --volumes-from gitlab-runner-config \
     gitlab/gitlab-runner:latest

docker run gitlab-runner register

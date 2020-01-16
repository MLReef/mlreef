#!/bin/bash

docker-compose down

docker container rm frontend
docker container rm backend
docker container rm mlreef-postgrespostgres
docker container rm gitlab
docker container rm gitlab-runner-dispatcher
docker container rm postgres
docker container rm redis
docker volume    rm sock
docker volume    rm  postgresql-data
docker volume    rm  gitlab-data
docker volume    rm  gitlab-runner-config

docker-compose up --detach          # start the compose file in detached mode

echo "Gitlab is starting"
sleep 20
echo "Please loging with root:password and get the runner registration token"
echo "Gitlab will need some time to start"
echo "url: http://localhost:10080/admin/runners"
echo "Please enter Runner registration token here:"

read token

bin/register-local-gitlab-runner.sh $token

echo "Runner was registered successfully"
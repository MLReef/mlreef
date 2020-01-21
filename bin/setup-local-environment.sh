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
docker volume    rm postgresql-data
docker volume    rm gitlab-data
docker volume    rm gitlab-runner-config
docker volume    rm frontend_sock
docker volume    rm frontend_postgresql-data
docker volume    rm frontend_gitlab-runner-config


docker-compose up --detach          # start the compose file in detached mode

echo "Wait: Gitlab is starting ..."
sleep 30

# 1. Manual Steps
echo "Please perform the two (2) manual steps for setup:"
echo "Loging with root:password into your local gitlab instance"
echo "Gitlab will need some time to start (try refreshing in your browser)"
echo " "
echo "1. Create a personal access token WITH SUDO PERMISSIONS"
echo "   http://localhost:10080/profile/personal_access_tokens"
echo "   You do not need to do anything with this token, it will get overwritten later"
echo " "
echo "2. go to url: http://localhost:10080/admin/runners and copy the runner-registration-token"
echo "   Paste the runner-registration-token here:"

read token

bin/register-local-gitlab-runner.sh $token
echo "Runner was registered successfully"

# 1. Inject known admin token
echo "Creating the admin token with GITLAB_ADMIN_TOKEN: ${GITLAB_ADMIN_TOKEN}"
chmod +x bin/setup-gitlab.sh
docker exec -it gitlab-postgres setup-gitlab.sh


# 3. restart services
echo "Restarting services after initial setup"
docker-compose stop
docker-compose up --detach

echo "Let backend wait for gitlab restart ... "
sleep 15
docker-compose stop backend nginx-proxy frontend
sleep 15
docker-compose up --detach backend nginx-proxy frontend

#!/bin/bash


#docker container rm -f nginx-proxy
#docker container rm -f frontend
#docker container rm -f backend
#docker container rm -f mlreef-postgres
#docker container rm -f gitlab
#docker container rm -f gitlab-runner-dispatcher
#docker container rm -f postgresql
#docker container rm -f gitlab-postgresql
#docker container rm -f redis
#docker container prune -f

#docker volume    rm -f nginx-proxy
#docker volume    rm -f frontend
#docker volume    rm -f backend
#docker volume    rm -f mlreef-postgres
#docker volume    rm -f postgresql
#docker volume    rm -f postgresql-data
#docker volume    rm -f gitlab-postgresql
#docker volume    rm -f gitlab-data
#docker volume    rm -f redis
#docker volume prune -f
#docker network prune -f

#docker ps --all
#docker volume ls
#docker network ls
docker-compose down
docker-compose rm -f -v -s

# These values are also hardcded in the docker compose file
export GITLAB_SECRETS_SECRET_KEY_BASE="1111111111122222222222333333333334444444444555555555566666666661234"
export    GITLAB_SECRETS_OTP_KEY_BASE="1111111111122222222222333333333334444444444555555555566666666661234"
export     GITLAB_SECRETS_DB_KEY_BASE="1111111111122222222222333333333334444444444555555555566666666661234"
export             GITLAB_ADMIN_TOKEN="-QmLDx6yHfzmgp5_XDz_"
docker-compose up --detach


echo "Wait: Gitlab is starting ..."
sleep 60

# 1. Manual Steps
echo "Please perform the manual steps for setup:"
echo "Login with root:password into your local gitlab instance"
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
docker exec -it postgresql setup-gitlab.sh


# 3. restart services
echo "Restarting services after initial setup"
docker-compose stop
docker-compose up --detach

echo "Let backend wait for gitlab restart ... "
sleep 15
docker-compose stop backend nginx-proxy frontend
sleep 15
docker-compose up --detach backend nginx-proxy frontend


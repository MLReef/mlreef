#!/bin/bash

docker-compose down
docker-compose rm -f -v -s
docker volume rm frontend_sock
docker volume rm frontend_gitlab-data
docker volume rm frontend_gitlab-runner-config
docker volume rm frontend_gitlab-runner-data
docker volume rm frontend_mlreefsql-data
docker volume rm frontend_postgresql-data
docker volume ls
echo "Tip: You CAN delete other unused volumes with: docker volume prune"

# These values are also hardcded in the docker compose file
export GITLAB_SECRETS_SECRET_KEY_BASE=1111111111122222222222333333333334444444444555555555566666666661234
export    GITLAB_SECRETS_OTP_KEY_BASE=1111111111122222222222333333333334444444444555555555566666666661234
export     GITLAB_SECRETS_DB_KEY_BASE=1111111111122222222222333333333334444444444555555555566666666661234
# we must not check this in. the setup does not fail due to that var: export             GITLAB_ADMIN_TOKEN=-QmLDx6yHfzmgp5_XDz_
docker-compose up --detach

echo "Wait: for postgresql is starting ..."
sleep 60

docker-compose stop backend
sleep 60

# 1. Inject known admin token
echo "Creating the admin token with GITLAB_ADMIN_TOKEN: ${GITLAB_ADMIN_TOKEN}"
chmod +x bin/setup-gitlab.sh
docker exec -it postgresql setup-gitlab.sh
docker-compose up --detach


# 2. Manual Steps
echo "Please perform the manual steps for setup:"
echo "Login with root:password into your local gitlab instance"
echo "Gitlab will need some time to start (try refreshing in your browser)"
echo " "
echo "1. go to url: http://localhost:10080/admin/runners and copy the runner-registration-token"
echo "   Paste the runner-registration-token here:"

read TOKEN


echo "Removing configuration if it exists"
docker exec gitlab-runner-dispatcher ls -al  /etc/gitlab-runner/config.toml
docker exec gitlab-runner-dispatcher rm      /etc/gitlab-runner/config.toml
docker exec gitlab-runner-dispatcher ls -al  /etc/gitlab-runner/config.toml

docker exec gitlab-runner-dispatcher gitlab-runner register   \
  --non-interactive                                           \
  --url="http://gitlab:80/"                                   \
  --docker-network-mode frontend_default                      \
  --registration-token "$TOKEN"                               \
  --executor "docker"                                         \
  --docker-image alpine:latest                                \
  --docker-volumes /var/run/docker.sock:/var/run/docker.sock  \
  --description "local developer runner"                      \
  --tag-list "docker"                                         \
  --run-untagged="true"                                       \
  --env "ENVIRONMENT_TEST_VARIABLE=foo-bar"                   \
  --locked="false"                                            \
  --access-level="not_protected"

echo Debug log the configuration file to the console
docker exec gitlab-runner-dispatcher cat     /etc/gitlab-runner/config.toml


echo "Runner was registered successfully"

sleep 60
docker-compose up --detach

#echo Test connection for admin:
#curl -f -I -X GET --header "Content-Type: application/json" --header "Accept: application/json" --header "PRIVATE-TOKEN: $GITLAB_ADMIN_TOKEN" "localhost:20080/api/v1"
#curl -f -I -X GET --header "Content-Type: application/json" --header "Accept: application/json" --header "PRIVATE-TOKEN: $GITLAB_ADMIN_TOKEN" "localhost:10080/api/v4/users/1"

#!/bin/sh
set -e
set -x


if [ "$1" = "" ]; then
  echo "Missing instance url"
  exit 1
fi

if [ "$2" = "" ]; then
  echo "Missing IMAGE_PATH"
  exit 1
fi
INSTANCE=$1
IMAGE_PATH=$2

echo "starting deploy.sh"
echo "----------------------------------------"
echo "The EC2 instance is: $INSTANCE"
echo "Frontend image path IMAGE_PATH is $IMAGE_PATH"

ssh-keyscan -H "$INSTANCE" >> ~/.ssh/known_hosts

alias remote-ec2="ssh -i development_deployment.pem -o 'AddKeysToAgent yes' ubuntu@\${INSTANCE} "

# rewrite docker dompose file
sed -i "s~master/bin~$CI_COMMIT_REF_NAME/bin~"                    docker-compose.yml
sed -i "s/$IMAGE_NAME:master/$IMAGE_NAME:$CI_COMMIT_REF_SLUG/"    docker-compose.yml
sed -i "s~-\ postgresql-data~-\ /data/postgres~"                  docker-compose.yml
sed -i "s~-\ gitlab-data~-\ /data/gitlab~"                        docker-compose.yml
sed -i "s~GITLAB_HOST=localhost~GITLAB_HOST=$INSTANCE~"           docker-compose.yml
sed -i "s/\ \ postgresql-data/#postgresql-data/"                  docker-compose.yml
sed -i "s/\ \ gitlab-data/#postgresql-data/"                      docker-compose.yml
cat docker-compose.yml
scp -i development_deployment.pem -o 'AddKeysToAgent yes' docker-compose.yml ubuntu@${INSTANCE}:~

remote-ec2 "sudo cat docker-compose.yml"
remote-ec2 "sudo docker-compose up -d"

# wait for startup and installation of gitlab
sleep 300

echo "Registering packaged runner to local Gitlab instance"
remote-ec2 "sudo docker exec -i gitlab-runner gitlab-ci-multi-runner register  \
  --non-interactive                             \
  --url \"http://gitlab:80\"                    \
  --registration-token \"xCsBLo7kBpwxp1wMv4JR\" \
  --executor \"docker\"                         \
  --docker-image alpine:latest                  \
  --description \"Docker Compose Packaged\"     \
  --tag-list \"docker,aws\"                     \
  --run-untagged=true                           \
  --locked=\"false\"                            "



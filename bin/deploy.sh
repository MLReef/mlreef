#!/bin/sh
set -e
set -x

PORT=10080

alias remote-ec2="ssh -i development_deployment.pem -o 'AddKeysToAgent yes' ubuntu@\${INSTANCE}"

while [ -n "$1" ]; do
  case "$1" in
  -f | --file) IMAGE_PATH="$2"
    echo "Using docker image: $IMAGE_PATH"
    shift ;;
  -i | --instance) INSTANCE="$2"
    echo "Connecting to ec2 instance $INSTANCE"
    shift ;;
  -p | --port) PORT="$2"
    echo "Expecting gitlab at port $PORT"
    shift ;;
  *) echo "Option $1 not recognized" ;;
  esac
  shift
done

echo "Successfuly parsed parameters"

if [ "$INSTANCE" = "" ]; then
  echo "Missing instance url. Use the -i or --instance option"
  exit 1
fi
if [ "$IMAGE_PATH" = "" ]; then
  echo "Missing docker image. Use the -I or --image option"
  exit 1
fi


echo "starting deploy.sh"
echo "----------------------------------------"

ssh-keyscan -H "$INSTANCE" >>~/.ssh/known_hosts

DOCKER_COMPOSE="docker-compose.yml"

# rewrite docker dompose file
# change download path from master branch to current branch on gitlab.com
#sed -i "s~master/bin~$CI_COMMIT_REF_NAME/bin~" docker-compose.yml
# change the frontend docker image from master branch to current branch
sed -i "s/$IMAGE_NAME:master/$IMAGE_NAME:$CI_COMMIT_REF_SLUG/"          $DOCKER_COMPOSE
# change postgres-data local image to /data/postgres on host machine
sed -i "s~-\ postgresql-data~-\ /data/postgres~"                        $DOCKER_COMPOSE
# change gitlab-data local image to /data/gitlab on host machine
sed -i "s~-\ gitlab-data~-\ /data/gitlab~"                              $DOCKER_COMPOSE
# Let gitlab know its own URL
# deactivate "docker portable volumes
sed -i "s/\ \ postgresql-data/#postgresql-data/"                        $DOCKER_COMPOSE
sed -i "s/\ \ gitlab-data/#postgresql-data/"                            $DOCKER_COMPOSE
sed -i "s~GITLAB_HOST=localhost~GITLAB_HOST=$INSTANCE~"                 $DOCKER_COMPOSE
cat $DOCKER_COMPOSE

# upload modified compose to ec2 instance
scp -i development_deployment.pem -o 'AddKeysToAgent yes' $DOCKER_COMPOSE ubuntu@${INSTANCE}:

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

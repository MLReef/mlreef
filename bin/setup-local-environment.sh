#!/bin/bash

docker-compose down --remove-orphans

while [ -n "$1" ]; do
  case "$1" in
  -f | --force)
    echo "Stopping and removing _ALL_ docker containers"
    docker stop $(docker ps -a -q)
    docker rm $(docker ps -a -q)
    ;;
  *)
    echo "Option $1 not recognized"
    echo "Use -f or --force to stop and remove _ALL_ docker containers"
    exit 1
    ;;
  esac
  shift
done

echo "### Cleaning local docker context"
docker-compose rm --force --stop -v
docker volume ls
docker volume prune -f
cp local.env local.env.bak
rm local.env

if [ "$GITLAB_SECRETS_SECRET_KEY_BASE" = "" ]; then
  export GITLAB_SECRETS_SECRET_KEY_BASE=secret11111111112222222222333333333344444444445555555555666666666612345
fi

if [ "$GITLAB_SECRETS_OTP_KEY_BASE" = "" ]; then
  export GITLAB_SECRETS_OTP_KEY_BASE=secret11111111112222222222333333333344444444445555555555666666666612345
fi

if [ "$GITLAB_SECRETS_DB_KEY_BASE" = "" ]; then
  export GITLAB_SECRETS_DB_KEY_BASE=secret11111111112222222222333333333344444444445555555555666666666612345
fi

if [ "$GITLAB_ADMIN_TOKEN" = "" ]; then
  export GITLAB_ADMIN_TOKEN=xzPdxQ-JzacYS6AWvVZJ
fi

src/bin/deploy.sh                           \
  --gitlab-admin-token $GITLAB_ADMIN_TOKEN  \
  --runtime docker                          \
  --container-wait 60

#!/bin/bash
# shellcheck disable=SC2162 #read without '-r' will mangle backslashes

while [ -n "$1" ]; do
  case "$1" in -f | --force)
    echo "Cleaning local docker context"
    echo "Stopping and removing MLreef's docker containers"
    touch local.env
    docker-compose rm --force --stop -v
    docker rm -f gateway       | true
    docker rm -f frontend      | true
    docker rm -f backend       | true
    docker rm -f mlreefdb      | true
    docker rm -f gitlab        | true
    docker rm -f gitlab-runner | true
    docker rm -f redis         | true
    ;;
  *)
    echo "Option $1 not recognized"
    echo "Use -f or --force to stop and remove _ALL_ docker containers"
    exit 1
    ;;
  esac
  shift
done

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
  export GITLAB_ADMIN_TOKEN=local-api-token
fi

src/bin/deploy.sh --gitlab-admin-token $GITLAB_ADMIN_TOKEN

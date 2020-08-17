#!/bin/bash
########################################
set -x # output all commands
set -e # exit on immediately on every error
set -u # error on usage of undefined variables
########################################
export DB_HOST=postgres
export DB_NAME=mlreef_backend
export DB_PASSWORD=password
export DB_PORT=5432
export DB_USER=postgres

export REDIS_HOST="redis"
export REDIS_PORT=6379
export POSTGRES_DB=$DB_NAME
export POSTGRES_USER=$DB_USER
export POSTGRES_PASSWORD=$DB_PASSWORD
export DOCKER_HOST="tcp://docker:2375" # gitlab needs this to support docker testcontainers
export DOCKER_DRIVER=overlay2          # gitlab needs this to support docker testcontainers
export DOCKER_TLS_CERTDIR=""           # "/certs" gitlab needs this to support docker testcontainers

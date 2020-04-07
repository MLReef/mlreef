#!/usr/bin/env bash
##!/bin/sh

# run the initialisation of the db for gitlab in the background
chmod +x /usr/local/bin/init-gitlab-db.sh
setsid /usr/local/bin/init-gitlab-db.sh >/var/log/gitlab.log 2>&1 </var/log/gitlab.log &

# start the normal entrypoint
/docker-entrypoint.sh postgres

exec "$@"

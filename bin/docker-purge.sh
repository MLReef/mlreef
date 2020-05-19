#!/bin/bash

echo "Attention this command will stop and delete **ALL** Docker containers on this machine."
echo "It will also remove all volumes and networks"
echo "Type 'y' to continue"
# shellcheck disable=SC2162
read IN
if [ "$IN" != "y" ]; then
  echo "You entered '$IN'; exiting."
  exit 0
fi
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker volume rm -f $(docker volume ls -q)

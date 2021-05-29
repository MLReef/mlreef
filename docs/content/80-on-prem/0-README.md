Installing MLReef On Premises
====================

The best way to run MLReef on your own on-premises infrastructure is the MLReef Nautilus package.
Nautilus is a single docker image containing everything necessary to create machine learning projects
and run ML workloads.

Nautilus Contains:
* MLReef Management Service
* Postgres
* Gitlab for hosting Git repositories
* Gitlab Runners for running Machine Learning workloads
* API Gateway


Installation
--------------------
In order to run MLReef Nautilus locally you just have to execute the following `docker run` command.
This will start up a local instance of mlreef with persistent docker volumes named `mlreef-opt`, `mlreef-etc`,
and `mlreefdb-opt` containing all user data.

```
docker run -it --rm --detach --name mlreef           \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume mlreef-opt:/var/opt/gitlab   \
  --volume mlreef-etc:/etc/gitlab       \
  --volume mlreefdb-opt:/var/opt/mlreef \
  --publish 2022:22                     \
  --publish 80:80                       \
  --publish 8081:8081                   \
  --publish 5050:5050                   \
  --publish 10080:10080                 \
  --publish 6000:6000                   \
  registry.gitlab.com/mlreef/mlreef:latest
```
The container comes up with a default runner running on same docker network on localhost.

### Run mlreef with docker volume binding

In order to run MLReef Nautilus locally with local volume binding, you just have to execute 
the following `docker run` command.
This will start up a local instance of mlreef with persistent data on `/root/mlreef-gitlab-opt`,
`/root/mlreef-gitlab-etc` and `/root/mlreefdb-opt` paths.

```
docker run -it --rm --detach --name mlreef           \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --volume /root/mlreef-gitlab-opt:/var/opt/gitlab   \
  --volume /root/mlreef-gitlab-etc:/etc/gitlab       \
  --volume /root/mlreefdb-opt:/var/opt/mlreef        \
  --publish 2022:22                     \
  --publish 80:80                       \
  --publish 8081:8081                   \
  --publish 5050:5050                   \
  --publish 10080:10080                 \
  --publish 6000:6000                   \
  registry.gitlab.com/mlreef/mlreef:latest
```
The container comes up with a default runner running on same docker network on localhost.

The mlreef app would be available  on `http://localhost`.

### Run mlreef in a separate docker network

In order to run MLReef Nautilus locally in a separate docker network, you just have to execute 
the following commands.
It includes:
A network `mlreef-docker-network` creation if not exists and `docker run` command.
This will start up a local instance of mlreef with persistent docker volumes named `mlreef-opt`,
`mlreef-etc` and `mlreefdb-opt` containing all user data.
You can use any network name instead of `mlreef-docker-network`.

```
DOCKER_NETWORK="mlreef-docker-network"
docker network inspect $DOCKER_NETWORK >/dev/null 2>&1 || \
  docker network create -d bridge $DOCKER_NETWORK

docker run -it --rm --detach --name mlreef           \
  --volume /var/run/docker.sock:/var/run/docker.sock \
  --net $DOCKER_NETWORK                 \
  --volume mlreef-opt:/var/opt/gitlab   \
  --volume mlreef-etc:/etc/gitlab       \
  --volume mlreefdb-opt:/var/opt/mlreef \
  --publish 2022:22                     \
  --publish 80:80                       \
  --publish 8081:8081                   \
  --publish 5050:5050                   \
  --publish 10080:10080                 \
  --publish 6000:6000                   \
  registry.gitlab.com/mlreef/mlreef:latest
```
The container comes up with a default runner running on same docker network on localhost.

The mlreef app would be available  on `http://localhost`.

Adding Machine Learning Runners
--------------------
The best way to host additional ML runners is to run them as separate docker containers.
This can be done on machines separate from the MLReef application server.
The runners must have network access to the MLReef application server.

#### Getting the Registration token
After startup is completed you can query MLReef's Gitlab service for the current
runner registration token by executing this `docker exec` command

```
docker exec -it mlreef gitlab-rails runner -e production "puts Gitlab::CurrentSettings.current_application_settings.runners_registration_token" | tr -d '\r'```
```

#### Register the Runner with MLReef
Then on the machine hosting the runner you need to execute a normal runner registration command.

The default `$GITLAB_PORT` is `10080`

```
docker exec -it ml-runner                   \
  gitlab-runner register --non-interactive  \
  --url="$MLREEF_HOST:$GITLAB_PORT"         \
  --registration-token "$TOKEN"             \
  --executor "docker"                       \
  --docker-image alpine:latest              \
  --docker-privileged="true"                \
  --docker-volumes /var/run/docker.sock:/var/run/docker.sock    \
  --description "Packaged Runner"           \
  --tag-list "docker,local-docker"          \
  --run-untagged="true"                     \
  --locked="false"                          \
  --access-level="not_protected"
```


GPU Capabilities
--------------------

A gitlab-runner can be setup for different executors with GPU capabilities as per following doc:

https://docs.gitlab.com/runner/configuration/gpus.html

 

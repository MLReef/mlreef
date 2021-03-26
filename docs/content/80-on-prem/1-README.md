Installing MLReef On Premises on offline server
====================

The best way to run MLReef on your own on-premises infrastructure is the MLReef Nautilus package.
Nautilus is a single docker image containing everything necessary to create machine learning projects
and run ML workloads.

Nautilus contains:
* MLReef Management Service
* Postgres
* Gitlab for hosting Git repositories
* Gitlab Runners for running Machine Learning workloads
* API Gateway


Installation
--------------------
Two steps need to be done in order to run MLReef Nautilus locally on a server which has no internet access.

1. In the first step, run `bin/build-export-nautilus-offline` to pull and tar all required images at one place.
Then copy the tar files to the offline server at a location of your choice.

2. In the second step, run `bin/build-run-nautilus-offline` with tar files location as an argument.
This will start up a the local instance of MLReef with persistent docker volumes named `mlreef-opt`, `mlreef-etc`,
and `mlreefdb-opt` containing all user data on offline server.

The installation on an online server:
```
git clone git@gitlab.com:mlreef/mlreef.git
bin/build-export-nautilus-offline

```
Copy the tar files from `mlreef-images-tar` to the offline server.
Copy bin/build-run-nautilus-offline script to offline server.

On the offline host:
```
bin/build-run-nautilus-offline $THE_PATH_OF_TAR_FILES
```
The container comes up with a default runner running on same docker network on localhost.


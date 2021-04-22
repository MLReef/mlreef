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

**The installation on an online server:**
```
git clone git@gitlab.com:mlreef/mlreef.git
bin/build-export-nautilus-offline

```
Copy the tar files from `mlreef-images-tar` to the offline server.
Copy bin/build-run-nautilus-offline script to offline server.

**On the offline host:**
```
bin/build-run-nautilus-offline -d $THE_PATH_OF_TAR_FILES -s $PIP_SERVER(optional)
```
Example:
```
bin/build-run-nautilus-offline -d mlreef-images-tar
bin/build-run-nautilus-offline -d mlreef-images-tar -s localhost:10010/simple
bin/build-run-nautilus-offline -d mlreef-images-tar -s https://python.example.com/

```

The container comes up with a default runner running on same docker network on localhost.

**Notes for pip server in offline mode:**

* If the pip server is running on the same offline host with MLReef, `localhost` needs to be used for pip server URL, e.g : `localhost:10010/simple` .

* If the pip server is running on some other host in intra network, the DNS host entry needs to be configured for docker.

  Example for Ubuntu:

1. Get the DNS Server IP:

```

$ nmcli dev show | grep 'IP4.DNS'
IP4.DNS[1]:                             192.168.0.1

```

2. Edit 'dns' in /etc/docker/daemon.json (create this file if already not there). Multiple DNS server IPs can be added separated by comma.

```
{
    "dns": ["192.168.0.1"]
}
```

3. Restart docker

```
$ sudo service docker restart

```

Now, the PIP server host should be accessible from mlreef service as well.

**Installing a pypi server** 

Install pypiserver (https://pypi.org/project/pypiserver) with this command:

```
pip install pypiserver                
mkdir ~/packages                      # put offline python packages into this directory.

```

Copy some packages into your ~/packages folder and then get your pypiserver up and running:

```
python3 -m pip download -d ~/packages -r <requirements file>

```

Start the server with this command, you can choose a different port number:

```
pypi-server -p 10010 ~/packages &      # Will listen to all IPs.

```

From the client computer, type this to test if the pypip server is working:

```
pip install --extra-index-url http://localhost:10010/simple/ <package-name>

```

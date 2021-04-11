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
bin/build-run-nautilus-offline -d mlreef-images-tar
bin/build-run-nautilus-offline -d mlreef-images-tar -s http://172.17.0.1:10100
bin/build-run-nautilus-offline -d mlreef-images-tar -s https://python.example.com/

The container comes up with a default runner running on same docker network on localhost.

**Notes for pip server in offline mode:**

* If the pip server is running on the same offline host with MlReef, use the bridge docker0 IP as pip_server IP.

  Example:
```
  sudo ip addr show docker0
  4: docker0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default
    link/ether 56:84:7a:fe:97:99 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 scope global docker0
       valid_lft forever preferred_lft forever
    inet6 fe80::5484:7aff:fefe:9799/64 scope link
       valid_lft forever preferred_lft forever
```
  So, 172.17.0.1 needs to be used for IP.

* If the pip server is running on some other host in intra network, the DNS host entry needs to be configured for docker.

  Example for Ubuntu:
```
1. Get the DNS Server IP:
$ nmcli dev show | grep 'IP4.DNS'
IP4.DNS[1]:                             192.168.0.1
2. Edit 'dns' in /etc/docker/daemon.json (create this file if already not there). Multiple DNS server IPs can be added separated by comma.

{
    "dns": ["192.168.0.1"]
}
3. Restart docker
$ sudo service docker restart

```
Now, the PIP server host should be accessible from mlreef service as well.

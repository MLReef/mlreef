MLReef Extendable Pipeline Framework
====================================


## Usage

To run the EPF locally from a docker container use this command:
```
docker run --name=epf-container --rm --tty --volume ${HOME}:/root --volume ${PWD}:/app registry.gitlab.com/mlreef/epf:latest python --version
```


## Alternative Usage 2

Add the following alias to your `~/.bash_rc` or `~/.bash_profile` depending on your OS 

```
#    --rm                       # Automatically remove the container when it exits
#    --tty                      # Allocate a pseudo-TTY
#    --volume ${HOME}:/root     # Bind mount host os user home directory to container root
#    --volume ${pwd}:/app       # Mount current directory to /app
#    s5:latest                  # Select docker image
alias epf-run="docker run --name=epf-shell-alias-container                    \
    --rm                                                                      \
    --tty                                                                     \
    --volume ${HOME}:/root                                                    \
    --volume ${PWD}:/app                                                      \
    registry.gitlab.com/mlreef/epf:latest"
```




## Infrastructure
The MLReef Infrastructure is deplyoyed on Aamazon Web Services (AWS). 

### Gitlab Runner Manager
The so called Gitlab Runner Bastion is a specially configured EC2 Instance.
To login you need the private keypair.
login: `ssh -i "Runner-Bastion-Keypair.pem" ubuntu@ec2-35-156-142-172.eu-central-1.compute.amazonaws.com`

The installation is based on this article: [link](https://rpadovani.com/aws-s3-gitlab)

#### Management Commands
```shell script
sudo vi /etc/gitlab-runner/config.toml # edit the bastion configuration file
sudo gitlab-runner start     # start the runner manger service
sudo gitlab-runner stop      # stop the runner manger service
sudo gitlab-runner restart   # restart the runner manger service
sudo gitlab-runner run       # start the runner manger in the local shell session (shows log output)
```

### Gitlab Runner Instances
The type of runner instance has to be configured in the Runner Manager and is currently set to `m4.2xlarge`.
There is also a support request pending to allow us to use `p3.2xlarge` and `p3.16xlarge` instances.
More information on instance types in the [AWS documentation](https://aws.amazon.com/ec2/instance-types/) 


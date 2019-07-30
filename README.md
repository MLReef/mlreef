# MLReef Backend and Infrastructure

## Infrastructure
The MLReef Infrastructure is deplyoyed on Aamazon Web Services (AWS). 

### Gitlab Runner Manager
The so called Gitlab Runner Bastion is a specially configured EC2 Instance.
To login you need the private keypair.
login: `ssh -i "Runner-Bastion-Keypair.pem" ubuntu@ec2-35-156-142-172.eu-central-1.compute.amazonaws.com`

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

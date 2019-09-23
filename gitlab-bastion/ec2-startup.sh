#!/bin/bash
yum update -y

sudo apt-get install debootstrap

# Setup Gitlab Repository and install gitlab-runner
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-ci-multi-runner/script.deb.sh | sudo bash
sudo apt-get install -y gitlab-ci-multi-runner
sudo mkdir /var/lib/gitlab-runner | true
sudo chmod 777 /var/lib/gitlab-runner

# Install Docker Machine
sudo curl -L https://github.com/docker/machine/releases/download/v0.12.2/docker-machine-`uname -s`-`uname -m` >/tmp/docker-machine
sudo chmod +x /tmp/docker-machine
sudo cp /tmp/docker-machine /usr/local/bin/docker-machine

sudo apt install -y docker.io

# Fix Ubuntu Bug https://gitlab.com/gitlab-org/gitlab-runner/issues/1605


export TOML="/etc/gitlab-runner/config.toml"
sudo rm -rf "$TOML"

sudo gitlab-ci-multi-runner register          \
  --non-interactive                           \
  --url "https://gitlab.com/"                 \
  --registration-token "LEAazFo7ZfJysnY_ore3" \
  --executor "docker+machine"                 \
  --docker-image alpine:latest                \
  --description "aws-gitlab-runner-spawner"   \
  --tag-list "docker,aws"                     \
  --run-untagged="true"                       \
  --locked="false"

LINE=$(sudo cat $TOML | grep token)
sudo rm -rf "$TOML"

# tee copies data from standard input to each FILE, and also to standard output.
echo | sudo tee $TOML <<EOF
concurrent = 6
check_interval = 0

[[runners]]
  name = "aws-gitlab-runner-spawner"
  limit = 2
  url = "https://gitlab.com/"
$LINE
  executor = "docker+machine"
  [runners.docker]
    tls_verify = false
    image = "alpine:latest"
    privileged = true
    disable_cache = true
    volumes = ["/cache"]
    shm_size = 0
  [runners.machine]
    IdleCount = 0
    MachineDriver = "amazonec2"
    MachineName = "runner-%s"
    MachineOptions = [
      "amazonec2-access-key=AKIAZHRIVYHPXNXMHGEN",
      "amazonec2-secret-key=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",
      "amazonec2-ssh-user=ubuntu",
      "amazonec2-region=eu-central-1",
      "amazonec2-instance-type=m4.xlarge",
    ]
    IdleTime = 1800

EOF

#    MachineOptions = ["amazonec2-access-key=AKIAZHRIVYHPXNXMHGEN",
#      "amazonec2-ami=ami-996372fd",
#      "amazonec2-zone=a",
#      "amazonec2-root-size=32",
#      "amazonec2-request-spot-instance=true",
#      "amazonec2-spot-price=0.03"
#      "amazonec2-vpc-id=vpc-xxxxx",
#      "amazonec2-subnet-id=subnet-xxxxx",

sudo service gitlab-runner start

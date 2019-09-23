#!/bin/bash

# Following the Guide
# https://about.gitlab.com/2017/11/23/autoscale-ci-runners/
curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-ci-multi-runner/script.deb.sh | sudo bash
sudo apt-get install gitlab-ci-multi-runner

curl -L https://github.com/docker/machine/releases/download/v0.12.2/docker-machine-`uname -s`-`uname -m` >/tmp/docker-machine &&
chmod +x /tmp/docker-machine &&
sudo cp /tmp/docker-machine /usr/local/bin/docker-machine

export TOML="/etc/gitlab-runner/config.toml"
sudo rm -rf "$TOML"

sudo gitlab-ci-multi-runner register          \
  --non-interactive                           \
  --url "https://gitlab.com/"                 \
  --registration-token "LEAazFo7ZfJysnY_ore3" \
  --executor "docker+machine"                 \
  --docker-image alpine:latest                \
  --description "aiops-runner-dispatcher"     \
  --tag-list "docker,aws"                     \
  --run-untagged="true"                       \
  --locked="false"

LINE=$(sudo cat $TOML | grep token)
sudo rm -rf "$TOML"

# tee copies data from standard input to each FILE, and also to standard output.
echo | sudo tee $TOML <<EOF
concurrent = 12
check_interval = 0

[[runners]]
  name = "aiops-runner-dispatcher"
  limit = 6
  url = "https://gitlab.com/"
$LINE
  executor = "docker+machine"
  [runners.docker]
    tls_verify = false
    image = "alpine:latest"
    privileged = true
    disable_cache = false
    volumes = ["/cache"]
    shm_size = 0
  [runners.machine]
    IdleCount = 0
    MachineDriver = "amazonec2"
    MachineName = "mlreef-aiops-%s"
    MachineOptions = [
      "amazonec2-access-key=AKIAZHRIVYHPXNXMHGEN",
      "amazonec2-secret-key=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",
      "amazonec2-ssh-user=ubuntu",
      "amazonec2-region=eu-central-1",
      "amazonec2-instance-type=m4.xlarge",
      "amazonec2-ami=ami-050a22b7e0cf85dd0",
    ]
    IdleTime = 1800

EOF

sudo service gitlab-runner start

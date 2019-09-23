#!/bin/bash
yum update -y

# Fix Ubuntu Bug https://gitlab.com/gitlab-org/gitlab-runner/issues/1605
# https://gitlab.com/gitlab-org/gitlab-runner/blob/master/docs/install/linux-repository.md#apt-pinning
# cat <<EOF | sudo tee /etc/apt/preferences.d/pin-gitlab-runner.pref
# Explanation: Prefer GitLab provided packages over the Debian native ones
# Package: gitlab-runner
# Pin: origin packages.gitlab.com
# Pin-Priority: 1001
# EOF


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
sudo apt-get install debootstrap
rm -rf script | true
sudo tee > script <<EOF
#!/bin/bash

set -e
# set -x

REVISION=10.5.0

#if [ "\$(id -u)" -ne 0 ]; then
#    printf "E: This script requires root privileges.\n" >&2
#    exit 1
#fi
if [ ! -x "\$(which cdebootstrap)" ]; then
    printf "W: 'cdebootstrap' is not available.\n" >&2
    exit 3
fi
if [ ! -x "\$(which docker)" ]; then
    printf "W: Docker is not available.\n" >&2
    exit 3
fi

if ! service docker status >>/dev/null; then
    printf "W: Docker is not running.\n" >&2
    exit 3
fi

if [ -z "\${http_proxy}" ]; then
    export http_proxy="\$(apt-config --format '%f %v%n' dump | awk '/Acquire::http::Proxy\ / {print \$2}')"
    if [ -n "\${http_proxy}" ]; then
        printf "I: Detected proxy \${http_proxy}\n"
    fi
fi

clean() {
    docker rmi -f gitlab-runner-prebuilt:\${REVISION} 2>>/dev/null || true
}
trap clean EXIT TERM INT

clean
rm -rf /var/cache/gitlab-runner/*

## Spinner:
## http://mebsd.com/coding-snipits/bash-spinner-example-freebsd-loading-spinner.html
i=1;
sp="/-\|";
tee_spinner() {
    local L
    while read -r L; do
        printf "%s\b" "${sp:i++%${#sp}:1}"       # spinner/bash
        printf "%s\n" "$L" >> "\$1"
    done
    printf "\b\n"
}

set -u
cd /var/cache/gitlab-runner

export BLOG="/var/cache/gitlab-runner/cdebootstrap.log"
rm -f "\${BLOG}" || true

printf "I: Generating GitLab Runner Docker image. This may take a while...\n"
printf "I: cdebootstrap; saving build log to \${BLOG} ."
debootstrap --verbose                                       \
    --variant=minbase                                       \
    --exclude="dmsetup,systemd-sysv,systemd,udev"           \
    --include="bash,ca-certificates,git,netcat-traditional" \
    stable ./debian-minbase http://deb.debian.org/debian/   \
2>&1 | tee_spinner "\${BLOG}"

XZ_OPT="-2v" tar -C debian-minbase -caf stable.tar.xz .
rm -rf ./debian-minbase

cp -v /usr/bin/gitlab-runner-helper .
cp -v /usr/lib/gitlab-runner/gitlab* .
cp -v /usr/lib/gitlab-runner/Dockerfile .

## Build docker image:
printf "I: docker build "
docker build --no-cache --rm --force-rm \
    -t gitlab-runner-prebuilt:\${REVISION} -f ./Dockerfile .

## Build image (instead of container, like upstream does):
## Depends on "nodim_loadimage.patch".
printf "I: Packing image into /var/lib/gitlab-runner/gitlab-runner-prebuilt.tar.xz\n"
#docker save gitlab-runner-prebuilt:\${REVISION} | XZ_OPT="-v" xz -c > /var/lib/gitlab-runner/gitlab-runner-prebuilt.tar.xz
#docker save gitlab-runner-prebuilt:\${REVISION} | gzip --no-name -c -9 > /var/lib/gitlab-runner/gitlab-runner-prebuilt.tar.gz

## Build container (follows upstream):
docker create --name=gitlab-runner-prebuilt-\${REVISION} gitlab-runner-prebuilt:\${REVISION} /bin/sh
docker export gitlab-runner-prebuilt-\${REVISION} | XZ_OPT="-v" xz -c > /var/lib/gitlab-runner/gitlab-runner-prebuilt.tar.xz
#docker export gitlab-runner-prebuilt-\${REVISION} | gzip --no-name -c -9 > /var/lib/gitlab-runner/gitlab-runner-prebuilt.tar.gz
docker rm -f gitlab-runner-prebuilt-\${REVISION}

clean
EOF
sudo chmod +x script
export SCRIPT="/usr/lib/gitlab-runner/mk-prebuilt-images.sh"
sudo rm -rf $SCRIPT | true
sudo mv script $SCRIPT
sudo sh $SCRIPT


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
  name = "aws-ai-ops-runner-dispatcher"
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

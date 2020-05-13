#!/bin/sh
# shellcheck disable=SC2028

set -e

log() {
  echo "### $(date +%Y-%m-%d\ %H:%M:%S) ### $1"
}

INSTANCE="localhost"
DOCKER_ENV="local.env"
GITLAB_PORT=10080


AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
GITLAB_ADMIN_TOKEN=""
# The Gitlab runner runtime defines how the runner manager deploys pipeline runs
# docker: new pipeline runs are spawned as sister container to the runner manager
# nvidia: like _docker_ with access and visibility of the GPU(s) enabled
# Autodetect nvidia runtime
nvidia-smi >/dev/null 2>&1 && RUNNER_RUNTIME="nvida" || RUNTIME=""
if [ "$RUNNER_RUNTIME" = "" ]; then
  log "Nvidia cuda drivers NOT found. Setting Gitlab runners to default CPU runtime."
else
  log "Found nvidia cuda drivers GPU. Setting Gitlab runners to use 'nvidia' runtime."
fi

# backup local.env if it exits
cp local.env local.env.bak 2>/dev/null || true
# delete local.enc if it exists
rm -f local.env 2>/dev/null || true

###############################################################################
if [ "$(uname)" = "Darwin" ]; then
  echo "Running on OSX"
  set -e
elif [ "$(expr substr "$(uname -s)" 1 5)" = "Linux" ]; then
  echo "Running on LINUX"
  set -e
elif [ "$(uname)" = "CYGWIN_NT-10.0" ]; then
  echo "Running on Windows 10 Cygwin"
  set +e   # This was added after testing on Saathvik's machine
else
  echo "WARNING: Cannot identify operating system. This might be okay"
  echo "You probably have to add you OS: '$(uname)' to the script"
  sleep 10
fi

###############################################################################
while [ -n "$1" ]; do
  case "$1" in
  -e | --docker-environment-file)
    DOCKER_ENV="$2"
    echo "Using docker env file $DOCKER_ENV"
    shift
    ;;
  -ga | --gitlab-admin-token)
    GITLAB_ADMIN_TOKEN="$2"
    echo "Using GITLAB_ADMIN_TOKEN $GITLAB_ADMIN_TOKEN"
    shift
    ;;
  -gb | --gitlab-secrets-key-base)
    GITLAB_SECRETS_SECRET_KEY_BASE="$2"
    echo "Using GITLAB_ADMIN_TOKEN $GITLAB_SECRETS_SECRET_KEY_BASE"
    shift
    ;;
  -go | --gitlab-opt-key-base)
    GITLAB_SECRETS_OTP_KEY_BASE="$2"
    echo "Using GITLAB_ADMIN_TOKEN $GITLAB_SECRETS_OTP_KEY_BASE"
    shift
    ;;
  -gd | --gitlab-db-key-base)
    GITLAB_SECRETS_DB_KEY_BASE="$2"
    echo "Using GITLAB_ADMIN_TOKEN $GITLAB_SECRETS_DB_KEY_BASE"
    shift
    ;;
  -i | --instance)
    INSTANCE="$2"
    echo "Connecting to ec2 instance $INSTANCE"
    shift
    ;;
  -k | --key)
    AWS_ACCESS_KEY_ID="$2"
    echo "Using AWS_ACCESS_KEY_ID $AWS_ACCESS_KEY_ID"
    shift
    ;;
  -n | --name)
    EC2_INSTANCE_NAME="$2"
    echo "Using EC2_INSTANCE_NAME $EC2_INSTANCE_NAME"
    shift
    ;;
  -s | --secret)
    AWS_SECRET_ACCESS_KEY="$2"
    echo "Using AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY"
    shift
    ;;
  *)
    echo "Option $1 not recognized"
    exit 1
    ;;
  esac
  shift
done

#
# Checking input parameters
#
if [ "$INSTANCE" = "" ]; then
  echo "Missing instance url. Use the -i or --instance option"
  exit 1
fi
if [ "$GITLAB_ADMIN_TOKEN" = "" ]; then
  echo "Missing GITLAB_ADMIN_TOKEN. Use the -ga or --gitlab-admin-token option"
  exit 1
fi
if [ "$GITLAB_SECRETS_SECRET_KEY_BASE" = "" ]; then
  echo "Missing GITLAB_SECRETS_SECRET_KEY_BASE. Use the -gb or --gitlab-secrets-key-base"
  exit 1
fi
if [ "$GITLAB_SECRETS_OTP_KEY_BASE" = "" ]; then
  echo "Missing GITLAB_SECRETS_OTP_KEY_BASE. Use the -go or --gitlab-opt-key-base"
  exit 1
fi
if [ "$GITLAB_SECRETS_DB_KEY_BASE" = "" ]; then
  echo "Missing GITLAB_SECRETS_DB_KEY_BASE. Use the -gd or --gitlab-db-key-base"
  exit 1
fi

# If we are working locally, we do not want to interface with EC2
if [ $INSTANCE != "localhost" ]; then
  if [ "$AWS_ACCESS_KEY_ID" = "" ]; then
    echo "Missing AWS_ACCESS_KEY_ID. Use the -k or --key option"
    exit 1
  fi
  if [ "$AWS_SECRET_ACCESS_KEY" = "" ]; then
    echo "Missing AWS_SECRET_ACCESS_KEY. Use the -s or --secret option"
    exit 1
  fi

fi
echo "Successfuly parsed command line parameters"

#
####
log "### Starting Deployment"
####
log "Writing Docker's env file: $DOCKER_ENV"
touch $DOCKER_ENV
echo "# Automatically added by the deploment pipeline .gitlab-ci-deploy.yml" >$DOCKER_ENV
{
  echo "# The REACT_APP_API_GATEWAY is used by the frontend to direct API calls"
  echo "REACT_APP_API_GATEWAY=http://$INSTANCE"
  echo ""
  echo "# Only Used during deployment for gitlab configuration and runner configuration"
  echo "# The gitlab server always serves port 80 locally. By setting the GITLAB_PORT variable,"
  echo "# we let gitlab know, that the container's port 80 is mapped differently from the outside."
  echo "GITLAB_PORT=$GITLAB_PORT"
  echo ""
  echo "# Used by the backend to connect to gitlab"
  echo "# The hostname 'gitlab' is created by the local docker network"
  echo "# The port used here must be the same as GITLAB_PORT"
  echo "GITLAB_ROOT_URL=http://gitlab:$GITLAB_PORT"
  echo ""
  echo "# The GITLAB_ADMIN_TOKEN is shared between Gitlab and the Backend"
  echo "GITLAB_ADMIN_TOKEN=$GITLAB_ADMIN_TOKEN"
  echo ""
  echo "# These secrets are used by Gitlab to encrypt passwords and tokens"
  echo "# Changing them will invalidate the GITLAB_ADMIN_TOKEN as well as all other tokens"
  echo GITLAB_SECRETS_SECRET_KEY_BASE=$GITLAB_SECRETS_SECRET_KEY_BASE
  echo GITLAB_SECRETS_OTP_KEY_BASE=$GITLAB_SECRETS_OTP_KEY_BASE
  echo GITLAB_SECRETS_DB_KEY_BASE=$GITLAB_SECRETS_DB_KEY_BASE

} >>$DOCKER_ENV

####
log "Starting Deployment"
docker-compose pull
log "Stopping serviced gateway frontend backend mlreef-postgres"
docker-compose stop gateway frontend backend mlreefdb
log "Starting Deployment"

####
log "MANDATORY ENV VARS:"
cat $DOCKER_ENV


#
#
# Step 1 Startup Gitlab
#
#
# Checks if gitlab is present at $INSTANCE:10081 which is mapped to "gitlab:80" with a _curl_ request
# This is the default setting
#
# @returns: The HTTP code received by _curl_.
# 302: means that Gitlab is up and running
# 502: Gitlab is still starting or broken
checkGitlab80() {
  curl --silent --output /dev/null -w ''%{http_code}'' $INSTANCE:10081
}
checkGitlabPort() {
  curl --silent --output /dev/null -w ''%{http_code}'' $INSTANCE:$GITLAB_PORT/$1
}

log "1. Starting Gitlab Omnibus"
# the container startup wait is necessary to let gitlab initialise the database
log "docker-compose up --detach gitlab gitlab-runner"
docker-compose up --detach gitlab gitlab-runner
log "Waiting for Gitlab to start."
log "Looking for Gitlab at ports 80 and $GITLAB_PORT"
# Port 10081 is the mappet to Gitlab's initial port (80) in the docker-compose.yml
until [ "$(checkGitlab80)" = "302" ] || [ "$(checkGitlabPort)" = "302" ]; do
  printf '.'
  sleep 5;
done
echo ""
#
#
# Step 2 Configure Gitlabs port and external URL
#
#

if [ "$(checkGitlabPort)" = "302" ]; then
  log "2. Found Gitlab at expected port $GITLAB_PORT. Printing relevant parts of /etc/gitlab/gitlab.rb"
  docker exec gitlab sh -c 'cat /etc/gitlab/gitlab.rb | grep external_url\ \"'
elif [ "$(checkGitlab80)" = "302" ]; then
  log "Found Gitlab at port 80. Reconfiguring Gitlab for port $GITLAB_PORT"
  if [ $INSTANCE != "localhost" ]; then
    log "2. Configure Gitlab external_url "'http://$INSTANCE:$GITLAB_PORT'
    docker exec gitlab sh -c 'echo external_url \"$REACT_APP_API_GATEWAY:$GITLAB_PORT\" >> /etc/gitlab/gitlab.rb'
  else
    log "2. Configure Gitlab external_url "'http://gitlab:$GITLAB_PORT'
    # When running locally in docker compose, this lets the runners access Gitlab via the Docker network
    docker exec gitlab sh -c 'echo external_url \"http://gitlab:$GITLAB_PORT\" >> /etc/gitlab/gitlab.rb'
  fi
  log "Reconfigure Gitlab"
  docker exec gitlab gitlab-ctl reconfigure > /dev/null
  docker exec gitlab sh -c 'cat /etc/gitlab/gitlab.rb | grep external_url\ \"'
  log "Restart Gitlab"
  docker exec --detach gitlab gitlab-ctl restart
  sleep 30
  log "Waiting for Gitlab to start"
  until [ "$(checkGitlabPort)" = "302" ]; do
    printf '.'
    sleep 5;
  done
  log "Expecting code 302; received: $(checkGitlabPort)"
fi

log "Ensuring availability of the Gitlab API to start"
until [ "$(checkGitlabPort /api/v4/projects)" = "200" ]; do
  printf '.'
  sleep 5;
done
log "Expecting code 200; received: $(checkGitlabPort /api/v4/projects)"
log "Waiting for Gitlab Runners API. The runners API is running in a separate process from the normal API"
until [ "$(checkGitlabPort /runners)" = "302" ]; do
  printf '.'
  sleep 5;
done
log "Expecting code 302; received: $(checkGitlabPort /runners)"

#
#
# Step 3 Creating Gitlab Admin API token
#
#
log "3. Deleting all API tokens for root user (id=1)"
# http://gitlab.com/help/administration/troubleshooting/gitlab_rails_cheat_sheet.md
# Alternatively the token digest can be computed as follows:
# salt=$(echo $GITLAB_SECRETS_DB_KEY_BASE | cut -c1-32)
# token=$GITLAB_ADMIN_TOKEN$salt
# token_digest=$(echo $token | openssl sha256 -binary | base64 -)
docker exec -t gitlab sh -c "$(cat << EOM
  gitlab-rails runner -e production "
    User.find(1).personal_access_tokens.each do |cur|
      cur.delete
    end
  "
EOM
)"
log "3. Creating Admin API token $GITLAB_ADMIN_TOKEN. This might take up to 5 minutes"
docker exec -t gitlab sh -c "$(cat << EOM
  gitlab-rails runner -e production "User.find(1).personal_access_tokens.create(
    name: 'admin-api-token',
    token_digest: Gitlab::CryptoHelper.sha256('$GITLAB_ADMIN_TOKEN'),
    impersonation: false,
    scopes: [:api,:sudo]
  )"
EOM
)" #end of $(cat …)


#
#
# Step 4 Get Gitlab Runner registration token
#
#
log "4. Getting Gitlab runners registration token from Gitlab."
RUNNER_REGISTRATION_TOKEN=$(docker exec -t gitlab bash -c 'gitlab-rails runner -e production "puts Gitlab::CurrentSettings.current_application_settings.runners_registration_token"' | tr -d '\r')
echo "Gitlab RUNNER_REGISTRATION_TOKEN=$RUNNER_REGISTRATION_TOKEN"

#
#
# Step 5 Register Gitlab Runner
#
#
export DISPATCHER_DESCRIPTION="Packaged Dispatcher on $CI_COMMIT_REF_SLUG-$INSTANCE"
if [ $INSTANCE != "localhost" ]; then
  log "5. Configuring Gitlab Runner for cloud environment"
  # https://docs.gitlab.com/runner/configuration/advanced-configuration.html#volumes-in-the-runnersdocker-section
  docker exec gitlab-runner gitlab-runner register                \
    --non-interactive                                             \
    --name="${DISPATCHER_DESCRIPTION}"                            \
    --url="http://$INSTANCE:$GITLAB_PORT/"                        \
    --registration-token="$RUNNER_REGISTRATION_TOKEN"             \
    --request-concurrency="12"                                    \
    --docker-network-mode="mlreef-docker-network"                 \
    --executor "docker"                                           \
    --docker-runtime="$RUNNER_RUNTIME"                            \
    --docker-image="alpine:latest"                                \
    --docker-volumes="/var/run/docker.sock:/var/run/docker.sock"  \
    --tag-list="docker"                                           \
    --run-untagged="true"                                         \
    --locked="false"                                              \
    --access-level="not_protected"                                \
    --cache-s3-server-address="s3.amazonaws.com"                  \
    --cache-s3-access-key="$AWS_ACCESS_KEY_ID"                    \
    --cache-s3-secret-key="$AWS_SECRET_ACCESS_KEY"                \
    --cache-s3-bucket-name="mlreef-runner-cache"                  \
    --cache-s3-bucket-location="eu-central-1"
else
  log "5. Configuring Gitlab Runner for local environment"
  # Register the runner on a local developers machine
  # The main differences are the URL and,
  # no caching on Amazon S3 buckets
  docker exec gitlab-runner gitlab-runner register                \
    --non-interactive                                             \
    --url="http://gitlab:$GITLAB_PORT/"                           \
    --docker-network-mode mlreef-docker-network                   \
    --registration-token="$RUNNER_REGISTRATION_TOKEN"             \
    --executor "docker"                                           \
    --docker-image alpine:latest                                  \
    --docker-volumes /var/run/docker.sock:/var/run/docker.sock    \
    --description "local developer runner"                        \
    --tag-list "docker"                                           \
    --run-untagged="true"                                         \
    --locked="false"                                              \
    --access-level="not_protected"
fi
log "Runner was registered successfully"

#
#
# Step 6 Start other Services
#
#
log "Ensuring availability of the Gitlab API to start"
until [ "$(checkGitlabPort /api/v4/projects)" = "200" ]; do
  printf '.'
  sleep 5;
done
log "Expecting code 200; received: $(checkGitlabPort /api/v4/projects)"
log "6. Start other services"
docker-compose up --detach
sleep 30 # Add an additional sleep in the end to improve user experience; So that Docker is started when the script ends

#
echo "Debug Log: gitlab runner configuration"
docker exec gitlab-runner cat /etc/gitlab-runner/config.toml

log "Done - MLReef has been successfully installed. "
#
#
#
#
#AIOPS_RUNNER_EC2_INSTANCE_TYPE="p2.xlarge"
# number of instances is limited by aws
# https://eu-central-1.console.aws.amazon.com/ec2/v2/home?region=eu-central-1#Limits:
#AIOPS_RUNNER_EC2_INSTANCE_LIMIT=1
#
# Just a copy of the multi runner configuration to be able to play with it
#echo | sudo tee "$TOML.multi-runner" <<EOF
#concurrent = 12
#check_interval = 0
#
#[[runners]]
#  name = "${DISPATCHER_DESCRIPTION}"
#  limit = $AIOPS_RUNNER_EC2_INSTANCE_LIMIT
#  url = "http://$INSTANCE:$GITLAB_PORT/"
#  token = "$TOKEN"
#  executor = "docker+machine"
#  [runners.docker]
#    tls_verify = false
#    image = "alpine:latest"
#    privileged = true
#    disable_cache = false
#    volumes = ["/cache"]
#    shm_size = 0
#  [runners.cache]
#    ServerAddress = "s3.amazonaws.com"
#    AccessKey = "$AWS_ACCESS_KEY_ID"
#    SecretKey = "$AWS_SECRET_ACCESS_KEY"
#    BucketName = "mlreef-runner-cache"
#    BucketLocation = "eu-central-1"
#  [runners.machine]
#    IdleCount = 0
#    MachineDriver = "amazonec2"
#    MachineName = "mlreef-aiops-%s"
#    MachineOptions = [
#      "amazonec2-access-key=$AWS_ACCESS_KEY_ID",
#      "amazonec2-secret-key=$AWS_SECRET_ACCESS_KEY",
#      "amazonec2-ssh-user=ubuntu",
#      "amazonec2-region=eu-central-1",
#      "amazonec2-zone=b",
#      "amazonec2-instance-type=$AIOPS_RUNNER_EC2_INSTANCE_TYPE",
#      "amazonec2-ami=ami-050a22b7e0cf85dd0",
#    ]
#    IdleTime = 5
#    OffPeakTimezone = ""
#    OffPeakIdleCount = 0
#
#EOF
#
#echo Test connection for admin:
#curl -f -I -X GET --header "Content-Type: application/json" --header "Accept: application/json" --header "PRIVATE-TOKEN: $GITLAB_ADMIN_TOKEN" "localhost:20080/api/v1"
#curl -f -I -X GET --header "Content-Type: application/json" --header "Accept: application/json" --header "PRIVATE-TOKEN: $GITLAB_ADMIN_TOKEN" "localhost:10080/api/v4/users/1"

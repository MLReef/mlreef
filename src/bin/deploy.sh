#!/bin/sh
set -e

INSTANCE="localhost"
GITLAB_PORT=10080

DOCKER_ENV="local.env"

AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
GITLAB_ADMIN_TOKEN=""
CONTAINER_STARTUP_WAIT="120" # This is a workaround variable used for deployment
# The Gitlab runner runtime defines how the runner manager deploys pipeline runs
# docker: new pipeline runs are spawned as sister container to the runner manager
# nvidia: like _docker_ with access and visibility of the GPU(s) enabled
RUNNER_RUNTIME="nvida"

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
  -p | --port)
    GITLAB_PORT="$2"
    echo "Expecting gitlab at port $GITLAB_PORT"
    shift
    ;;
  -r | --runtime)
    RUNNER_RUNTIME="$2"
    echo "Using gitlab RUNNER_RUNTIME $RUNNER_RUNTIME"
    shift
    ;;
  -s | --secret)
    AWS_SECRET_ACCESS_KEY="$2"
    echo "Using AWS_ACCESS_KEY_ID $AWS_SECRET_ACCESS_KEY"
    shift
    ;;
  -w | --container-wait)
    CONTAINER_STARTUP_WAIT="$2"
    echo "Using Container startup wait of: $CONTAINER_STARTUP_WAIT"
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
echo "### Starting Deployment"
####
echo "### 1. Writing Docker's env file: $DOCKER_ENV"
touch $DOCKER_ENV
echo "# Automatically added by the deploment pipeline .gitlab-ci-deploy.yml" >$DOCKER_ENV
{
  echo "# The REACT_APP_API_GATEWAY is used by the frontend to direkt API calls"
  echo "# The GITLAB_HOST is for gitlab to serve links correctly (see docker-compose.yml)"
  echo "REACT_APP_API_GATEWAY=http://$INSTANCE"
  echo "# The gitlab server always serves port 80 locally. By setting the GITLAB_PORT variable,"
  echo "# we let gitlab know, that the container's port 80 is mapped differently from the outside."
  echo "GITLAB_PORT=$GITLAB_PORT"
  echo "# The GITLAB_ROOT_URL is used by the backend to connect to gitlab"
  echo "# The hostname 'gitlab' is created by the local docker network"
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

echo "### Executing: docker-compose down --remove-orphans"
docker-compose down --remove-orphans

####
echo "### Starting Deployment"
####
echo "### MANDATORY ENV VARS:"
cat $DOCKER_ENV

echo "### 1. Start Gitlab Omnibus Preconfigured"
# the container startup wait is necessary to let gitlab initialise the database
docker-compose down --remove-orphans
echo "### Docker Compose Up"
docker-compose up --detach gitlab gitlab-runner
echo "### Sleep ${CONTAINER_STARTUP_WAIT}"
sleep "${CONTAINER_STARTUP_WAIT}"


echo '### 2. Configure Gitlab external_url http://$INSTANCE:$GITLAB_PORT'
docker exec gitlab sh -c 'echo external_url \"$REACT_APP_API_GATEWAY:$GITLAB_PORT\" >> /etc/gitlab/gitlab.rb'
docker exec gitlab sh -c 'cat /etc/gitlab/gitlab.rb | grep external_url'
echo "### Reconfigure Gitlab"
docker exec gitlab gitlab-ctl reconfigure > /dev/null
echo "### Restart Gitlab"
docker exec --detach gitlab gitlab-ctl restart
echo "### Sleep ${CONTAINER_STARTUP_WAIT}"
sleep "${CONTAINER_STARTUP_WAIT}"


echo "### 3. Creating Admin API token $GITLAB_ADMIN_TOKEN"
# http://localhost:10080/help/administration/troubleshooting/gitlab_rails_cheat_sheet.md
# Alternatively the token digest can be computed as follows:
# salt=$(echo $GITLAB_SECRETS_DB_KEY_BASE | cut -c1-32)
# token=$GITLAB_ADMIN_TOKEN$salt
# token_digest=$(echo $token | openssl sha256 -binary | base64 -)
#
docker exec -t gitlab bash -c '
  gitlab-rails runner -e production "User.find(1).personal_access_tokens.create(
  name: '"'"'admin-api-token'"'"',
  token_digest: Gitlab::CryptoHelper.sha256('"'"'$GITLAB_ADMIN_TOKEN'"'"'),
  impersonation: false,
  scopes: [:api,:sudo]
)
"
'


echo "### 4. Getting Gitlab runners registration token from Gitlab."
TOKEN=$(docker exec -t gitlab bash -c 'gitlab-rails runner -e production "puts Gitlab::CurrentSettings.current_application_settings.runners_registration_token"' | tr -d '\r')
echo TOKEN=$TOKEN

echo "### 5. Configuring gitlab runner"
export DISPATCHER_DESCRIPTION="Packaged Dispatcher on $CI_COMMIT_REF_SLUG-$INSTANCE"

if [ $INSTANCE != "localhost" ]; then
  # https://docs.gitlab.com/runner/configuration/advanced-configuration.html#volumes-in-the-runnersdocker-section
  docker exec gitlab-runner gitlab-runner register                \
    --non-interactive                                             \
    --name="${DISPATCHER_DESCRIPTION}"                            \
    --url="http://$INSTANCE:$GITLAB_PORT/"                        \
    --registration-token="$TOKEN"                                 \
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
  # Register the runner on a local developers machine
  # The main differences are the URL and,
  # no caching on Amazon S3 buckets
  docker exec gitlab-runner gitlab-runner register                \
    --non-interactive                                             \
    --url="http://gitlab:$GITLAB_PORT/"                           \
    --docker-network-mode mlreef-docker-network                   \
    --registration-token "$TOKEN"                                 \
    --executor "docker"                                           \
    --docker-image alpine:latest                                  \
    --docker-volumes /var/run/docker.sock:/var/run/docker.sock    \
    --description "local developer runner"                        \
    --tag-list "docker"                                           \
    --run-untagged="true"                                         \
    --locked="false"                                              \
    --access-level="not_protected"

fi

echo "### Runner was registered successfully"

#
sleep 30 # Add an additional sleep in the end to improve user experience; So that Docker is started when the script ends
echo "### 6. Start other services"
docker-compose up --detach
sleep 30 # Add an additional sleep in the end to improve user experience; So that Docker is started when the script ends

#
echo "### Done"
echo "Debug Log: gitlab runner configuration"
docker exec gitlab-runner cat /etc/gitlab-runner/config.toml

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

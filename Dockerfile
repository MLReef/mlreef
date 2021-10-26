####################################################################
####################################################################
# Welcome to MLReef Nautilus dockerfile.
#
# https://gitlab.com/gitlab-org/omnibus-gitlab/-/tree/master/docker
#
####################################################################
FROM gradle:6.5-jdk8 AS BACKEND_BUILDER
ENV JVM_OPTS -Xmx2g -Xms2g -XX:MaxPermSize=1024m
# provide a tmp/cache dir
VOLUME /tmp

# all following commands will be executed from inside the workdir
WORKDIR /workdir
# copy the sources to image (except .dockerignore)
ADD backend/ /workdir
RUN gradle -x test :mlreef-rest:bootJar :mlreef-rest:prepareDocker -x :mlreef-rest:asciidoctor



# The image must correspond with the image used in bin/npm
FROM node:14.16.1-alpine AS FRONTEND_BUILDER
ARG CI_COMMIT_REF_SLUG
ARG CI_PIPELINE_ID=-1
ARG CI_PIPELINE_URL="CI URL N/A"
ARG NODE_OPTIONS="--max-old-space-size=2048"

# add npm binaries to shell path
ENV PATH /app/node_modules/.bin:$PATH

# all following commands will be executed from inside the workdir
WORKDIR /workdir
# copy the sources to image (except .dockerignore)
ADD web/ /workdir

# create build.info with build and add build information to React's env variables
RUN echo "Gitlab Pipeline $CI_PIPELINE_ID built on "$(date +%Y-%m-%d\ %H:%M:%S)  > build.info   && \
    echo "build branch was $CI_COMMIT_REF_SLUG"                                 >> build.info   && \
    echo "$CI_PIPELINE_URL"                                                     >> build.info   && \
    cat build.info                                                                              && \
    # Use Gitlab's internal unique job ID as build version. This way versions can be traced back to a specific build.
    echo "SKIP_PREFLIGHT_CHECK=true"                                             > .env         && \
    echo "REACT_APP_VERSION=$CI_PIPELINE_ID"                                    >> .env         && \
    echo "REACT_APP_BUILD_NUMBER=$CI_PIPELINE_ID"                               >> .env         && \
    echo "REACT_APP_BRANCH_NAME=$CI_COMMIT_REF_SLUG"                            >> .env         && \
    echo "REACT_APP_EXTERNAL_URL=https://mlreef.com"                            >> .env         && \
    echo "Time: $(date +%Y-%m-%d\ %H:%M:%S)"                                                    && \
    cat .env


# install all NPM packages and compile the react app
RUN echo "Frontend Build Time: $(date +%Y-%m-%d\ %H:%M:%S)" && \
    npm install --global --silent react-scripts@3.0.1       && \
    npm install --silent .                                  && \
    echo "Frontend Build Time: $(date +%Y-%m-%d\ %H:%M:%S)" && \
    # execute tests first, so there should be a halt when compiling if tests fail
    npm test                                                && \
    echo "Frontend Build Time: $(date +%Y-%m-%d\ %H:%M:%S)" && \
    npm run build                                           && \
    echo "Frontend Build Time: $(date +%Y-%m-%d\ %H:%M:%S)"



FROM gitlab/gitlab-ce:12.7.0-ce.0 AS NAUTILUS
MAINTAINER mlreef.com

# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
RUN export JAVA_HOME

# TODO rename to MLREEF_INSTANCE_HOST
ENV INSTANCE_HOST "localhost"
# TODO rename to MLREEF_GITLAB_PORT
ENV GITLAB_PORT "10080"
ENV MLREEF_DOCKER_REGISTRY_PORT "5050"

# TODO is this correct, can it be moved in the above GITLAB_OMNIBUS_CONFIG block
ENV GITLAB_HTTPS "false"
# TODO is this correct, can it be moved in the above GITLAB_OMNIBUS_CONFIG block
ENV TZ 'Austria/Vienna'
# TODO is this correct, can it be moved in the above GITLAB_OMNIBUS_CONFIG block
ENV GITLAB_TIMEZONE 'Vienna'
# TODO is this correct, can it be moved in the above GITLAB_OMNIBUS_CONFIG block
ENV SSL_SELF_SIGNED 'false'

# MLReef Confguration
# Postgres version for MLReef backend Database
ENV MLREEF_PG_VERSION "11"
# Postgres OS and super user
ENV MLREEF_PG_USER "postgres"
# Postgres cluster name
ENV MLREEF_PG_CLUSTER "mlreefdb"
# TODO rename to MLREEF_DB_EXTENSION
ENV DB_EXTENSION "pg_trgm"
### Backend Config
ENV MLREEF_BACKEND_PORT "8081"
#Select the Backend's Spring profile
# TODO rename to MLREEF_SPRING_PROFILES_ACTIVE
ENV SPRING_PROFILES_ACTIVE "docker"
# Backend DB host
# TODO rename to MLREEF_DB_HOST
ENV DB_HOST "localhost"
# Backend DB port
# TODO rename to MLREEF_DB_PORT
ENV DB_PORT "6000"
# Backend DB user
# TODO rename to MLREEF_DB_USER
ENV DB_USER "mlreef"
# Backend DB password
# TODO rename to MLREEF_DB_PASS
ENV DB_PASS "password"
# Backend DB name
# TODO rename to MLREEF_DB_NAME
ENV DB_NAME "mlreef_backend"
# Backend Redis host
# TODO rename to MLREEF_REDIS_HOST
ENV REDIS_HOST "localhost"
# Backend Startup delay
# TODO rename to MLREEF_STARTUP_DELAY
ENV STARTUP_DELAY "30"
# EPF image tag, by default it will pick up master
ENV EPF_IMAGE_TAG "master"
# Experiment image tag, by default it will pick up master
ENV EXPERIMENT_IMAGE_TAG "master"
# Set PIP_SERVER to blank. In Nautilus, it could be set to local pip server to run Nautilus in offline mode
ENV PIP_SERVER ""


###
### Modify Gitlab Omnibus scripts
###
RUN mv /assets/wrapper /assets/gitlab-wrapper
# Remove the wait for sigterm from the gitlab wrapper script to make it "interactive"
# The MLReef wrapper will handle starting and stopping of services
RUN sed -i "/# Tail all logs/d" /assets/gitlab-wrapper
RUN sed -i "/# gitlab-ctl tail &/d" /assets/gitlab-wrapper
RUN sed -i "/# Wait for SIGTERM/d" /assets/gitlab-wrapper
RUN sed -i "/wait/d" /assets/gitlab-wrapper



###
### GITLAB RUNNER
###
# Install Gitlab Runner in Docker container
# https://docs.gitlab.com/runner/install/linux-manually.html
RUN apt-get update                          && \
    curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | bash  && \
    apt-get install --yes gitlab-runner     && \
    apt-get clean                           && \
    gitlab-runner --version



###
### SOFTWARE
###
# Install NGINX reverse proxy
# Install Open JDK 8 and fix cert issues
RUN apt-get update               && \
    apt-get install --assume-yes    \
    # NGINX is MLReef's API gateway
    nginx                           \
    ant                             \
    # THe java runtime for the MLReef backend
    openjdk-8-jdk                   \
    ca-certificates-java         && \
    # cleanup apt-get cache
    apt-get clean                && \
    # Fix cert issues
    update-ca-certificates -f    && \
    # Remove nginx default config
    rm -rf /etc/nginx/sites-enabled/default

# Install Docker and jq
RUN apt-get -y install curl apt-transport-https ca-certificates software-properties-common jq    && \
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add                        && \
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu xenial stable" |  \
                        tee /etc/apt/sources.list.d/docker.list                                  && \
    apt-get update                                                                               && \
    apt-get install -y docker-ce


####
#### BACKEND DATABASE
####
# Set up PostgreSQL for mlreefdb
# Add postgres repo to apt package manager
RUN apt-get update                                                                          && \
    apt-get install -y wget vim lsb-release                                                 && \
    wget --no-check-certificate -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc |  apt-key add -   && \
    RELEASE=$(lsb_release -cs)                                                              && \
    echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)"-pgdg main |  tee  /etc/apt/sources.list.d/pgdg.list

# Install Postgres
RUN apt-get update                      && \
    apt-get install -y acl sudo locales    \
    postgresql-${MLREEF_PG_VERSION} postgresql-client-${MLREEF_PG_VERSION} postgresql-contrib-${MLREEF_PG_VERSION}

######
###### BACKEND
######
# either from master:
# COPY --from=BACKEND_MASTER /app /app
# or: from BACKEND_BUILDER
# add the gradle dependencies and own artificats in a docker-friendly way
COPY --from=BACKEND_BUILDER /workdir/mlreef-rest/build/dependency/BOOT-INF/classes /app
COPY --from=BACKEND_BUILDER /workdir/mlreef-rest/build/dependency/BOOT-INF/lib     /app/lib
COPY --from=BACKEND_BUILDER /workdir/mlreef-rest/build/dependency/META-INF         /app/META-INF



######
###### FRONTEND
######
# Add nginx configuration. Note the name change of the file
# Copy frontend production build from the NPM stage
# This path has to correspond to the configuration in nginx_default.conf
COPY --from=FRONTEND_BUILDER /workdir/build /usr/share/nginx/html
# Add nginx configuration. Note the name change of the file
ADD web/nginx_default.conf /etc/nginx/conf.d/default.conf
RUN chmod 777 /etc/nginx/conf.d/default.conf
# TODO FIXME: nginx: [emerg] "gzip" directive is duplicate in /etc/nginx/conf.d/default.conf:14
RUN sed -i "/gzip on;/d" /etc/nginx/conf.d/default.conf


# Wrapper to handle additional script to run after default gitlab image's /assets/wrapper
ADD nautilus/assets/ /assets
ADD epf/ /epf
ADD images/ /images

# Export derived env variables from the above defined ENV variables.These should not be directly overwritten.
RUN cat /assets/dynamic-env > /etc/bash.bashrc

CMD ["/assets/mlreef-wrapper"]

# Volumes from Gitlab base image
VOLUME ["/etc/gitlab", "/var/log/gitlab", "/var/opt/gitlab"]
# Volumes for mlreef's backend database
VOLUME  ["/etc/postgresql", "/var/log/${MLREEF_PG_CLUSTER}-postgresql", "/var/opt/mlreef"]

# Expose mlreef postgres
EXPOSE $DB_PORT
# Expose HTTPS ports
EXPOSE $MLREEF_BACKEND_PORT 80 443 $GITLAB_PORT
# Expose Gitlab SSH port
EXPOSE 22
# Expose Docker registry port
EXPOSE $MLREEF_DOCKER_REGISTRY_PORT

ENV GITLAB_ROOT_EMAIL    "root@localhost"
ENV GITLAB_ROOT_PASSWORD "password"
# The GITLAB_ADMIN_TOKEN is shared between Gitlab and the Backend
ENV GITLAB_ADMIN_TOKEN   "token"

# These secrets are used by Gitlab to encrypt passwords and tokens
# Changing them will invalidate the GITLAB_ADMIN_TOKEN as well as all other tokens
ENV GITLAB_SECRETS_SECRET_KEY_BASE  "secret1111111111122222222222333333333334444444444555555555566666666661234"
ENV GITLAB_SECRETS_OTP_KEY_BASE     "secret1111111111122222222222333333333334444444444555555555566666666661234"
ENV GITLAB_SECRETS_DB_KEY_BASE      "secret1111111111122222222222333333333334444444444555555555566666666661234"

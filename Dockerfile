####################################################################
####################################################################
# Welcome to MLReef Nautilus dockerfile.
#
# https://gitlab.com/gitlab-org/omnibus-gitlab/-/tree/master/docker
#
####################################################################
FROM gitlab/gitlab-ce:12.7.0-ce.0
MAINTAINER mlreef.com

# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
RUN export JAVA_HOME

ENV GITLAB_OMNIBUS_CONFIG "\
    # This is the URL that Gitlab expects to be addressed at.   \
    # This URL will be sent to the runners as repo cloning url  \
    external_url 'http://localhost:10080';                      \
    # Deactivate HTTPS redirection of Gitlab's API gateway      \
    nginx['redirect_http_to_https'] = false;                    \
    # The external URL for the internal Docker registry         \
    registry_external_url 'http://localhost:5050';              \
    registry_nginx['enable'] = true;                            \
    # Access port for the internal Docker registry              \
    # (has to be exposed via Docker as well)                    \
    registry_nginx['listen_port'] = 5050;                       \
    "
ENV GITLAB_HTTPS "false"              # TODO: is this correct, can it be moved in the above GITLAB_OMNIBUS_CONFIG block
ENV GITLAB_ROOT_PASSWORD 'password'   # TODO: is this correct, can it be moved in the above GITLAB_OMNIBUS_CONFIG block
ENV TZ 'Austria/Vienna'               # TODO: is this correct, can it be moved in the above GITLAB_OMNIBUS_CONFIG block
ENV GITLAB_TIMEZONE 'Vienna'          # TODO: is this correct, can it be moved in the above GITLAB_OMNIBUS_CONFIG block
ENV SSL_SELF_SIGNED 'false'           # TODO: is this correct, can it be moved in the above GITLAB_OMNIBUS_CONFIG block

### MLReef DB config
ENV PG_VERSION=11
ENV PG_USER=postgres
ENV DB_EXTENSION=pg_trgm
### Backend Config
#Select the Backend's Spring profile
ENV SPRING_PROFILES_ACTIVE "docker"
# Backend DB host
ENV DB_HOST "localhost"
# Backend DB port
ENV DB_PORT "6000"
# Backend DB user
ENV DB_USER "mlreef"
# Backend DB password
ENV DB_PASS "password"
# Backend DB name
ENV DB_NAME "mlreef_backen"
# Backend Redis host
ENV REDIS_HOST "localhost"
# Backend Startup delay
ENV STARTUP_DELAY "30"



###
### SOFTWARE
###
# Install NGINX reverse proxy
# Install Open JDK 8 and fix cert issues
RUN apt-get update               && \
    apt-get install --assume-yes    \
    nginx                           \
    ant                             \
    openjdk-8-jdk                   \
    ca-certificates-java         && \
    apt-get clean
# Fix  cert issues
RUN  update-ca-certificates -f;
# Remove nginx default config
RUN rm -rf /etc/nginx/sites-enabled/default




####
#### BACKEND DATABASE
####
# Set up PostgreSQL for mlreefdb
#apt-repo addition
RUN apt-get update                                                                          && \
    apt-get install -y wget vim lsb-release                                                 && \
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc |  apt-key add -   && \
    RELEASE=$(lsb_release -cs)                                                              && \
    echo "deb http://apt.postgresql.org/pub/repos/apt/ ${RELEASE}"-pgdg main |  tee  /etc/apt/sources.list.d/pgdg.list

#PostgreSQL installation
RUN apt-get update                      && \
    apt-get install -y acl sudo locales    \
    postgresql-${PG_VERSION} postgresql-client-${PG_VERSION} postgresql-contrib-${PG_VERSION}

#basic config changes to hba and postgresql
RUN echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/${PG_VERSION}/main/pg_hba.conf                          && \
    sed -i  "s/^port.*=.*\\([0-9]\\)/port = ${DB_PORT}/g" /etc/postgresql/${PG_VERSION}/main/postgresql.conf     && \
    sed -i  "s/^#listen_addresses.*=.*'localhost'/listen_addresses='*'/g" /etc/postgresql/${PG_VERSION}/main/postgresql.conf && \
    cat /etc/postgresql/${PG_VERSION}/main/postgresql.conf

#Default DB, DB user and extension creation 
RUN cat /etc/postgresql/${PG_VERSION}/main/postgresql.conf | grep port && pg_ctlcluster 11 main start            && \
    ps -ef | grep postgres                                                                                       && \
    su -c - postgres "psql -p ${DB_PORT} --command \"CREATE USER $DB_USER WITH SUPERUSER PASSWORD '$DB_PASS';\"" && \
    su -c - postgres "createdb -p ${DB_PORT} -O ${DB_USER} ${DB_NAME}"                                           && \
    su -c - postgres "psql -p ${DB_PORT} --command \"CREATE EXTENSION IF NOT EXISTS ${DB_EXTENSION};\""          && \
    pg_ctlcluster 11 main stop



######
###### BACKEND
######
COPY --from=registry.gitlab.com/mlreef/mlreef/backend:master /app /app



######
###### FRONTEND
######
# Add nginx configuration. Note the name change of the file
COPY --from=registry.gitlab.com/mlreef/mlreef/gateway:master /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
RUN chmod 777 /etc/nginx/conf.d/default.conf
# Copy frontend production build from the NPM stage
# This path has to correspond to the configuration in nginx_default.conf
COPY --from=registry.gitlab.com/mlreef/mlreef/gateway:master /usr/share/nginx/html /usr/share/nginx/html
# Copy the test coverage report to the final stage
# The CI pipeline later extracts this report and makes it available in Gitlab
COPY --from=registry.gitlab.com/mlreef/mlreef/gateway:master /usr/share/coverage /usr/share/coverage



######
###### DEVELOPER SETUP
######
# Edit the Gitlab embedded Postgres configuration to be able external access to the Database
# The original line in PGCONF_TEMP is
# listen_addresses = '<%= @listen_address %>'    # what IP address(es) to listen on;
# The original line in PGCONF is

ENV GITLAB_PGCONF_TEMP /opt/gitlab/embedded/cookbooks/postgresql/templates/default/postgresql.conf.erb
ENV GITLAB_PGCONF /opt/gitlab/etc/gitlab.rb.template
RUN sed -i "s/<%= @listen_address %>/*/g" ${GITLAB_PGCONF_TEMP}      && \
    sed -i "s/#.*postgresql.*trust_auth_cidr_addresses.*/postgresql\['trust_auth_cidr_addresses'\] = \[\"0\.0\.0\.0\/0\"\]/g" ${GITLAB_PGCONF}

# Expose postgres
EXPOSE 5432 6000
###### END: DEVELOPER SETUP



# Wrapper to handle additional script to run after default gitlab image's /assets/wrapper
ADD nautilus/assets/** /assets
CMD ["/assets/mlreef-wrapper"]

# Volumes from Gitlab base image
VOLUME ["/etc/gitlab", "/var/log/gitlab","/var/opt/gitlab"]
# Volumes for mlreef's backend database
VOLUME  ["/etc/postgresql", "/var/log/postgresql", "/var/lib/postgresql"]

# Expose HTTPS ports
EXPOSE 8080 80 443 10080
# Expose Gitlab SSH port
EXPOSE 22
# Expose Docker registry port
EXPOSE 5050

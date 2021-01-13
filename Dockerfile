FROM gradle:6.5-jdk8 AS BUILDER

ENV JVM_OPTS -Xmx2g -Xms2g -XX:MaxPermSize=1024m

# provide a tmp/cache dir
VOLUME /tmp

WORKDIR /workdir
ADD backend /workdir
RUN gradle -x test :mlreef-rest:bootJar :mlreef-rest:prepareDocker -x :mlreef-rest:asciidoctor



####################################################################
# Start of actual MLReef Nautilus image
#
# https://gitlab.com/gitlab-org/omnibus-gitlab/-/tree/master/docker
FROM gitlab/gitlab-ce:12.7.0-ce.0
MAINTAINER mlreef.com

ENV GITLAB_OMNIBUS_CONFIG "\
    # This is the URL that Gitlab expects to be addressed at.   \
    # This URL will be sent to the runners as repo cloning url  \
    external_url 'http://localhost:10080';                      \
    # Deactivate automatic HTTPS redirection of Gitlab's API gateway    \
    nginx['redirect_http_to_https'] = false;                    \
    # The external URL for the internal Docker registry         \
    registry_external_url 'http://localhost:5050';              \
    registry_nginx['enable'] = true;                            \
    # Access port for the internal Docker registry              \
    # (has to be exposed via Docker as well)                    \
    registry_nginx['listen_port'] = 5050;                       \
    "

RUN apt-get update

# Install NGINX reverse proxy
RUN apt-get install --assume-yes nginx


# Install Open JDK 8 and fix cert issues
RUN apt-get install --assume-yes    \
    ant                             \
    openjdk-8-jdk                   \
    ca-certificates-java         && \
    update-ca-certificates -f;

# clean apt cache
RUN apt-get clean

# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
RUN export JAVA_HOME

# Add backend binaries in a docker-friendly way
COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/BOOT-INF/classes /app
COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/BOOT-INF/lib     /app/lib
COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/META-INF         /app/META-INF

ENV PG_VERSION=11                 \
    PG_USER=postgres              \
    DB_EXTENSION=pg_trgm          \
    SPRING_PROFILES_ACTIVE=docker \
    DB_HOST=localhost             \
    DB_PORT=6000                  \
    DB_USER=mlreef                \
    DB_PASS=password              \
    DB_NAME=mlreef_backend        \
    REDIS_HOST=localhost          \
    STARTUP_DELAY=30          

###Set up PostgreSQL for mlreefdb
#apt-repo addition
RUN apt-get update && apt-get install -y wget vim lsb-release   \
    && wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc |  apt-key add - \
    && RELEASE=$(lsb_release -cs)  \
    && echo "deb http://apt.postgresql.org/pub/repos/apt/ ${RELEASE}"-pgdg main |  tee  /etc/apt/sources.list.d/pgdg.list

#PostgreSQL installation
RUN apt-get update \
    && apt-get install -y acl sudo locales \
       postgresql-${PG_VERSION} postgresql-client-${PG_VERSION} postgresql-contrib-${PG_VERSION} 

#basic config changes to hba and postgresql
RUN  echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/${PG_VERSION}/main/pg_hba.conf \
     && sed -i  "s/^port.*=.*\\([0-9]\\)/port = ${DB_PORT}/g" /etc/postgresql/${PG_VERSION}/main/postgresql.conf \
     && sed -i  "s/^#listen_addresses.*=.*'localhost'/listen_addresses='*'/g" /etc/postgresql/${PG_VERSION}/main/postgresql.conf \
     && cat /etc/postgresql/${PG_VERSION}/main/postgresql.conf

#Default DB, DB user and extension creation 
RUN cat /etc/postgresql/${PG_VERSION}/main/postgresql.conf | grep port && pg_ctlcluster 11 main start \
    && ps -ef | grep postgres \
    && su -c - postgres "psql -p ${DB_PORT} --command \"CREATE USER $DB_USER WITH SUPERUSER PASSWORD '$DB_PASS';\"" \
    && su -c - postgres "createdb -p ${DB_PORT} -O ${DB_USER} ${DB_NAME}" \
    && su -c - postgres "psql -p ${DB_PORT} --command \"CREATE EXTENSION IF NOT EXISTS ${DB_EXTENSION};\"" \
    && pg_ctlcluster 11 main stop

###Set up PostgreSQL for mlreefdb ends

VOLUME  ["/etc/postgresql", "/var/log/postgresql", "/var/lib/postgresql"]

# Wrapper to handle additional script to run after default gitlab image's /assets/wrapper
ADD nautilus/assets/** /assets
CMD ["/assets/mlreef-wrapper"]




######START: DEVELOPER SETUP
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

# Expose HTTPS ports
EXPOSE 8080 80 443 10080
# Expose Gitlab SSH port
EXPOSE 22
# Expose Docker registry port
EXPOSE 5050

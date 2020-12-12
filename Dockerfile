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

# Install Open JDK 8 and fix cert issues
RUN apt-get update               && \
    apt-get install --assume-yes    \
    ant                             \
    openjdk-8-jdk                   \
    ca-certificates-java         && \
    apt-get clean                && \
    update-ca-certificates -f;

# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
RUN export JAVA_HOME

# Add backend binaries in a docker-friendly way
COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/BOOT-INF/classes /app
COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/BOOT-INF/lib     /app/lib
COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/META-INF         /app/META-INF


# Wrapper to handle additional script to run after default gitlab image's /assets/wrapper
ADD nautilus/assets/** /assets
CMD ["/assets/mlreef-wrapper"]




######START: DEVELOPER SETUP
# Edit the Postgres configuration to be able external access to the Database
# The original line in PGCONF_TEMP is
#     listen_addresses = '<%= @listen_address %>'    # what IP address(es) to listen on;
# The original line in PGCONF is

ENV PGCONF_TEMP /opt/gitlab/embedded/cookbooks/postgresql/templates/default/postgresql.conf.erb
ENV PGCONF /opt/gitlab/etc/gitlab.rb.template
RUN sed -i "s/<%= @listen_address %>/*/g" ${PGCONF_TEMP}      && \
    sed -i "s/#.*postgresql.*trust_auth_cidr_addresses.*/postgresql\['trust_auth_cidr_addresses'\] = \[\"0\.0\.0\.0\/0\"\]/g" ${PGCONF}

# Expose postgres
EXPOSE 5432
###### END: DEVELOPER SETUP

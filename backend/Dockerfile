FROM gradle:6.5-jdk8 AS BUILDER

# provide a tmp/cache dir
VOLUME /tmp

ENV DB_HOST=postgres
ENV DB_NAME=mlreef_backend
ENV DB_PASSWORD=password
ENV DB_PORT=25432
ENV DB_USER=postgres

ENV REDIS_HOST="redis"
ENV REDIS_PORT=26379
ENV POSTGRES_DB=$DB_NAME
ENV POSTGRES_USER=$DB_USER
ENV POSTGRES_PASSWORD=$DB_PASSWORD
# gitlab needs this to support docker testcontainers
ENV DOCKER_HOST="tcp://docker:2375"
# gitlab needs this to support docker testcontainers
ENV DOCKER_DRIVER=overlay2
# "/certs" gitlab needs this to support docker testcontainers
ENV DOCKER_TLS_CERTDIR=""

RUN echo "Use DB $DB_NAME with $DB_USER"

WORKDIR /workdir
ADD . /workdir
RUN gradle build -x test :mlreef-rest:bootJar :mlreef-rest:prepareDocker -x :mlreef-rest:asciidoctor


# Start a new docker stage here, and only copy the finished build artefacts.
FROM openjdk:8-jdk-alpine

# add the gradle dependencies and own artificats in a docker-friendly way
COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/BOOT-INF/classes /app
COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/BOOT-INF/lib     /app/lib
COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/META-INF         /app/META-INF

# start app
ENTRYPOINT ["java","-cp","app:app/lib/*","com.mlreef.rest.RestApplicationKt"]

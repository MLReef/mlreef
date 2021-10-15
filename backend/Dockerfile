FROM gradle:6.5-jdk8 AS BUILDER

ENV JVM_OPTS -Xmx2g -Xms2g -XX:MaxPermSize=1024m

# provide a tmp/cache dir
VOLUME /tmp

# all following commands will be executed in /app
WORKDIR /workdir
# copy the sources to image (except .dockerignore)
ADD . /workdir
RUN gradle -x test :mlreef-rest:bootJar :mlreef-rest:prepareDocker -x :mlreef-rest:asciidoctor


# Start a new docker stage here, and only copy the finished build artefacts.
FROM openjdk:8-jdk-slim

RUN apt update \
    && apt install -y wget gnupg gnupg2 gnupg1 \
    && wget https://dvc.org/deb/dvc.list -O /etc/apt/sources.list.d/dvc.list \
    && wget -qO - https://dvc.org/deb/iterative.asc | apt-key add - \
    && apt update \
    && apt install -y dvc \
    && rm -rf /var/lib/apt/lists/*

# add the gradle dependencies and own artificats in a docker-friendly way
COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/BOOT-INF/classes /app
COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/BOOT-INF/lib     /app/lib
COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/META-INF         /app/META-INF

# start app
ENTRYPOINT ["java","-cp","app:app/lib/*","com.mlreef.rest.RestApplicationKt"]


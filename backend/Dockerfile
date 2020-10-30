FROM gradle:6.5-jdk8 AS BUILDER

ENV JVM_OPTS -Xmx2g -Xms2g -XX:MaxPermSize=1024m


# provide a tmp/cache dir
VOLUME /tmp

WORKDIR /workdir
ADD . /workdir
RUN gradle -x test :mlreef-rest:bootJar :mlreef-rest:prepareDocker -x :mlreef-rest:asciidoctor


# Start a new docker stage here, and only copy the finished build artefacts.
FROM openjdk:8-jdk-alpine

# add the gradle dependencies and own artificats in a docker-friendly way
COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/BOOT-INF/classes /app
COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/BOOT-INF/lib     /app/lib
COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/META-INF         /app/META-INF

# start app
ENTRYPOINT ["java","-cp","app:app/lib/*","com.mlreef.rest.RestApplicationKt"]


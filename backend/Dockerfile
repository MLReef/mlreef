FROM gradle:6.5-jdk8 AS BUILDER

# provide a tmp/cache dir
VOLUME /tmp

WORKDIR /workdir
ADD . /workdir
RUN gradle build -x test :mlreef-rest:bootJar  -x :mlreef-rest:asciidoctor


# Start a new docker stage here, and only copy the finished build artefacts.
FROM openjdk:8-jdk-alpine

# add the gradle dependencies and own artificats in a docker-friendly way
#COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/BOOT-INF/classes /app
#COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/BOOT-INF/lib     /app/lib
#COPY --from=BUILDER /workdir/mlreef-rest/build/dependency/META-INF         /app/META-INF
COPY --from=BUILDER /workdir/mlreef-rest/build/libs         /app
RUN ls -al /app

# start app
#ENTRYPOINT ["java","-cp","app:","com.mlreef.rest.RestApplicationKt"]

FROM openjdk:8-jdk-alpine

# provide a tmp/cache dir
VOLUME /tmp

# add the gradle dependencies and own artificats in a docker-friendly way
COPY   build/dependency/BOOT-INF/classes /app
COPY   build/dependency/BOOT-INF/lib     /app/lib
COPY   build/dependency/META-INF         /app/META-INF

# start app
ENTRYPOINT ["java","-cp","app:app/lib/*","com.mlreef.rest.RestApplicationKt"]

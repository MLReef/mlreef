FROM openjdk:8-jdk-alpine

# provide a tmp/cache dir
VOLUME /tmp

# add dependecies of gradle build INSIDE of build/docker/
ARG DEPENDENCY=build/dependency

# add the dependencies and own artificats in a docker-friendly way
COPY ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY ${DEPENDENCY}/META-INF /app/META-INF
COPY ${DEPENDENCY}/BOOT-INF/classes /app

# start app
ENTRYPOINT ["java","-cp","app:app/lib/*","com.mlreef.rest.RestApplicationKt"]

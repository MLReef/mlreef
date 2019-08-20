FROM rainerkern/mlreef-eps:latest
MAINTAINER MLReef

RUN apt-get update && \
    apt-get install -y openjdk-8-jdk && \
    apt-get install -y ant && \
    apt-get clean;

# Fix certificate issues
RUN apt-get update && \
    apt-get install ca-certificates-java && \
    apt-get clean && \
    update-ca-certificates -f;

# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
RUN export JAVA_HOME

ENV KOTLIN_VERSION 1.3.30
RUN cd /usr/local && \
    curl -L -O https://github.com/JetBrains/kotlin/releases/download/v${KOTLIN_VERSION}/kotlin-compiler-${KOTLIN_VERSION}.zip && \
    unzip kotlin-compiler-${KOTLIN_VERSION}.zip && \
    mv kotlinc kotlin${KOTLIN_VERSION} && \
    rm kotlin-compiler-${KOTLIN_VERSION}.zip

ENV PATH=$PATH:/usr/local/kotlin${KOTLIN_VERSION}/bin

CMD ["java", "-version"]
CMD ["kotlin", "-version"]

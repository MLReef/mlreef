FROM docker:19.03.12
MAINTAINER MLReef

########## MLREEF ##########

RUN apk add --no-cache \
    git  \
    curl \
    wget \
    jq 

##### ADD files to the image
WORKDIR /
ADD src/bin /bin
RUN chmod +x /bin -R

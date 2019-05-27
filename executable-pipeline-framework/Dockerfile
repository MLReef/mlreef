FROM python:3.7

MAINTAINER MLReef

#ARG D_USR
#ARG D_PW
#ARG D_CONSTRING
#ARG D_DRV
#ARG CORS_ORIGINS

#ENV SB_DB_USR=${D_USR}
#ENV SB_DB_PAS=${D_PW}
#ENV SB_JDBC_CONSTRING=${D_CONSTRING}
#ENV SB_DB_DRIVER=${D_DRV}
#ENV SB_CORS_ORIGINS=${CORS_ORIGINS}

### ADD files to the image
WORKDIR /
ADD vergeml /bin/vergeml
ADD container-setup.sh /bin/container-setup.sh 
ADD container-startup.sh /bin/container-startup.sh

WORKDIR /app

# RUN commands ar run during image setup
RUN ["container-setup.sh"]

# CMD commands are run during container startup
CMD ["container-startup.sh"]


FROM python:3.7

MAINTAINER MLReef

# Update the linux to the latest versions
RUN apt-get update && apt-get upgrade -y

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


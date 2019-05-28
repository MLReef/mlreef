##### Base on python 3.7 image
FROM python:3.7
MAINTAINER MLReef

##### ADD files to the image
WORKDIR /
ADD vergeml /bin/vergeml


###### Setup Python and vergeml
WORKDIR /app
RUN echo "------------------------------------------------------------------------" && \
    echo "                       MLREEF EPS: Setting Up" && \
    echo "------------------------------------------------------------------------" && \
    python --version && \
    pip3 --version && \
    python -m pip install --upgrade --force pip && \
    pip install virtualenv && \
    # Switch Python to virtualenv "venv" && \
    virtualenv venv --distribute && \
    #source venv/bin/activate && \
    #pip install --upgrade tensorflow && \
    cd /bin/vergeml && \
    pip install vergeml


##### Add container startup script
CMD echo "------------------------------------" && \
    echo "       MLREEF EPS Starting" && \
    echo "------------------------------------" && \
    cd /app && \
    python --version && \
    pip3 --version && \

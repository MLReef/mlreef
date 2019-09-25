##### Base on python 3.7 image
FROM python:3.7
MAINTAINER MLReef

##### ADD files to the image
WORKDIR /
ADD src /epf
ADD src/bin /bin


###### Setup Python and vergeml
WORKDIR /app
RUN echo "------------------------------------------------------------------------" && \
    echo "                       MLREEF EPF: Setting Up"                            && \
    echo "------------------------------------------------------------------------" && \
    python --version 				                                                && \
    pip3 --version 				                                                    && \
    python -m pip install --upgrade --force pip                                     && \
    pip install virtualenv 		                                                    && \
    # Switch Python to virtualenv "venv" 	                                        && \
    virtualenv venv --distribute 	 	                                            && \
    #source venv/bin/activate            	                                        && \
    pip install --upgrade tensorflow     	                                        && \
    pip install keras   		 	                                                && \
    pip install sklearn 		 	                                                && \
    pip install Pillow  		                                                    && \
    pip install scikit-learn		                                                && \
    pip install matplotlib                                                          && \
    pip install opencv-python

##### Add container startup script
CMD echo "------------------------------------"                                     && \
    echo "       MLREEF EPF Starting" 	                                           	&& \
    echo "------------------------------------"                                     && \
    cd /app 					                                                    && \
    python --version 			                                                	&& \
    pip3 --version

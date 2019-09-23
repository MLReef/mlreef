#!/bin/bash
yum update -y

# start apache2 httpd
sudo chkconfig httpd on
sudo mkdir /var/log/httpd
sudo service httpd start
# chkconfig httpd on

# install node and npm
#sudo ln -s /opt/elasticbeanstalk/node-install/node-v10.14.1-linux-x64/bin/node /usr/bin/node
#sudo ln -s /opt/elasticbeanstalk/node-install/node-v10.14.1-linux-x64/bin/npm /usr/bin/npm
#curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
#nvm install node
#npm install --global react-scripts
#npm install --global create-react-app@latest

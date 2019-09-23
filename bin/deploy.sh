#!/bin/sh
set -e
set -x

if [ "$1" = "" ]; then
  echo "Missing instance url"
  exit 1
fi

if [ "$2" = "" ]; then
  echo "Missing IMAGE_PATH"
  exit 1
fi
INSTANCE=$1
IMAGE_PATH=$2

echo "starting deploy.sh"
echo "----------------------------------------"
echo "The EC2 instance is: $INSTANCE"
echo "IMAGE_PATH is $IMAGE_PATH"

ssh-keyscan -H "$INSTANCE" >> ~/.ssh/known_hosts

alias remote-ec2="ssh -i development_deployment.pem -o 'AddKeysToAgent yes' ec2-user@\${INSTANCE} "

remote-ec2 "sudo yum install --assumeyes docker"
remote-ec2 "sudo service docker start"
remote-ec2 "sudo docker run --detach --rm --publish 3000:3000 ${IMAGE_PATH} npm start"

# Configure node, npm and react
#remote-ec2 "sudo ln -s /opt/elasticbeanstalk/node-install/node-v10.14.1-linux-x64/bin/node /usr/bin/node"
#remote-ec2 "sudo ln -s /opt/elasticbeanstalk/node-install/node-v10.14.1-linux-x64/bin/npm /usr/bin/npm"
#remote-ec2 "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash"
#remote-ec2 "nvm install node"
#remote-ec2 "npm install --global react-scripts"
#remote-ec2 "npm install --global create-react-app@latest"

#remote-ec2 "rm -rf package-lock.json"
#remote-ec2 "rm -rf node_modules"
#remote-ec2 "npm install"
#remote-ec2 "npm run build"

#echo "starting server ..."
#remote-ec2 "nohup react-scripts start &"
#echo "The EC2 instance is: ssh -i development_deployment ec2-user@$INSTANCE"
#echo "website is available at http://$INSTANCE"

# configure apache2 httpd
#remote-ec2 "sudo chkconfig httpd on"
#remote-ec2 "sudo mkdir /var/log/httpd"
#remote-ec2 "sudo mv -f build/* /var/www/html/"
#remote-ec2 "sudo service httpd start"

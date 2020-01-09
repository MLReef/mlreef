![Build Status](https://gitlab.com/mlreef/frontend/badges/master/build.svg)

MLReef Frontend
====================
Please read the [Contribution Guidelines](CONTRIBUTE.md) carefully


Module Structure
--------------------
* **gitlab-api**: currently deprecated because of incompatibilities between kotlin-js and react.
* **web**: the npm based react frontend


Element styles and transitions
--------------------
Here is the XD file for the definitions of all elements: https://xd.adobe.com/spec/e23711b1-f385-4729-5034-632fbe73bb6b-9406/

**Color Pallette:**

<p>Deep dark (primary blue): #1D2B40</p>
<p>Almost white (base color, very light grey): #e5e5e5</p>
<p>Signal fire (red): #f5544d</p>
<p>Algae (green): #15B785</p>
<p>Sponge (yellow): #EABA44</p>
<p>Lagoon (light blue): #16ADCE</p>
<p>Less white (grey): #b2b2b2</p>

**Border Radius**
All border radius is: 0,3vw

Please also see "MLreef CD Guide" for detailed view of the corporate design features in MLreef.

Setup Developer Environment
--------------------
* Install Node (10.16.0 LTS)
  * Windows [link](https://nodejs.org/en/download/)
  * **OSX:**
  ```shell script
  # install homebrew
  /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
  # use homebrew to install node
  brew install node`
  ```
* Install react scripts `npm install --global react-scripts`

For setting up the frontend dependencies you have to run: `./gradlew npm_install` on Linux and MacOSX, or `gradlew.bat npm_install` on Windows


Run Locally
--------------------
For running locally please refer to the web module's [README.md](web/README.md) 


Production build
--------------------
To build the frontend project use: `./gradlew npm_run_build`


Per-Branch Develop Cloud Deployment
--------------------
MLReef's infrastructure is deployed to the AWS cloud automatically. One separate fresh environment for every branch
(feature-branch or other) deployed freshly for every developer push.

Currently, to deploy every branch to a separate ec2 instance the following steps are performed:
1. Build docker image for the frontend NodeJS App
2. Provision a new ec2 instance with docker pre-installed
3. Download user data (~40 GB) from s3
4. Start the MLReef service stack - based on our `docker-compose.yml` - on the ec2 instance
   The service stack consists of postgres, redis, gitlab, gitlab runner, micro services, NodeJS Frontend
5. Configure the gitlab-runner-dispatcher
   (This has to be done after gitlab has successfully started)
   The Gitlab runner dispatcher boots new ec2 instances for running gitlab pipelines

After a branch is merged/deleted the Gitlab pipeline is used again to terminate the ec2 instance



Infrastructure Deployment
-------------------

Infrastructure as Code as well as the MLReef deployment pipeline

### Instance Maintainance
To connect to a development instance you will need either the IP or hostname of the instance.
This can be found in the [Environments Section](https://gitlab.com/mlreef/infrastructure/-/environments) on gitlab.com

You will also need the most current `development.pem` which contains the private key to authenticate with the ec2 instance

To login to the an instance located at `ec2-3-122-224-139.eu-central-1.compute.amazonaws.com` use the following command.

```bash
ssh -i "development.pem" ubuntu@ec2-3-122-224-139.eu-central-1.compute.amazonaws.com

# to switch to the root user type:
sudo bash
```

### Docker Maintenance
To display all running containers
```bash
docker ps
docker ps -all
```

To look at the container's logs
```bash
docker logs $CONTAINER_NAME
```

### Initialise Docker 

Before the first start of a docker context you must provide the needed ENV vars!

```bash
docker-compose up
```

After starting for the first time, gitlab and gitlab post needs to be initialized.
Run the setup-gitlab.sh in the postgres container

```bash
docker exec -it gitlab-postgres setup-gitlab.sh
```

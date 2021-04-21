Developer Guide
--------------

This guide will help you setup MLReef and start working on it as a developer. 

### Module Structure
* **/backend**:    MLReef's Kotlin - Spring Boot backend
* **/bin**:      scripts which help developers  
* **/docs**:     documentation page based on gatsby
* **/nautilus**: assets for the all-in-one docker image
* **/web**:      the npm based react frontend as well as the node based end-to-end tests

### Run MLReef locally
Please follow the [on premises documentation](docs/content/80-on-prem/0-README.md) 

### Setup Infrastructure
From the repositories _root_ folder execute: `bin/setup-local-environment`

After the setup has finished you can connect to MLReef via: [http://localhost](http://localhost)


### Setup your frontend developer environment
From the `web` folder 
 1. Install react-scripts with: `bin/npm install react-scripts` 
 2. Install all frontend dependencies with `bin/npm install` 
 3. If you are running the backend on a different machine (e.g. a cloud instance)
    look at the config file `web/.env` for further instructions on how to configure it properly

### Run the frontend in development mode
The following commands all have to be executed from the `web` folder:

You can start the frontend separately with npm running `bin/npm start`

### Run the frontend in production mode
The following commands all have to be executed from the `web` folder:

To build the frontend's production docker image execute `docker build --tag frontend:local .`

To run the production image locally execute `docker run --rm --name frontend-prod-test --publish 80:80 frontend:local`


### Run the backend services locally
The setup script (`bin/setup-local-environment.sh`) script creates a new `local.env` file
with some important environment variables

*Important*: docker needs a "local.env" to run the stack.
**Do not change the gitlab after the setup**, as everything encrypted (all tokens and passwords) would then be lost.

After the initial setup you can start and stop your infrastructure by using
```bash
docker-compose stop            # "stop" keeps the storage intact
docker-compose up --detach
```

To delete your local environment use
```bash
docker-compose down
docker-compose rm --force --stop -v
```


### Troubleshooting

**Attention:** the `--force` option stops and removes all running docker containers

**hard-reset**: run `bin/setup-local-environment.sh --force` to nuke your local environment, generate a new local.env, and re-setup your stack.
Your data will be lost, but afterwards you will have docker volumes.


### Windows - additional steps
Ensure your git client is working correctly:
* Linux scripts must be in LF! Ensure that you checkout them out as-is and NOT convert to CRLF
* https://stackoverflow.com/questions/2517190/how-do-i-force-git-to-use-lf-instead-of-crlf-under-windows

For starting and setting up your local docker environment run: `bin/setup-local-environment.bat force` and follow the instructions for setting up your local instance, but without gitlab runners.
gitlab runners may not work yet under windows.


### Upgrading to a new version
To upgrade youe stack just run the following three commands
```bash
docker-compose stop
docker-compose pull
docker-compose up --detach
```


### Directly Connecting to different components
* The main entry point is the standard http port: 80
* The gitlab instance can be reached directly at port: 10080
* The backend can be reached directly at port.: 8080


Styleguide
--------------------
In this [list](STYLEGUIDE.md) you will all used standard UI elements.


Infrastructure
--------------------

### Per-Branch Cloud Deployment
MLReef's infrastructure is deployed to the AWS cloud automatically. Once a new branch is pushed,
a fresh environment is created and MLReef is deployed there.


Currently, the following steps are performed automatically during deployment.
1. Build docker image for the frontend NodeJS App
2. Provision a new ec2 instance with docker pre-installed
3. Docker's `.env` file is created which contains the URL of the new instance
4. Start the MLReef service stack - based on our `docker-compose.yml` - on the ec2 instance
   The service stack consists of postgres, redis, gitlab, gitlab runner, micro services, NodeJS Frontend
5. Configure the gitlab-runner-dispatcher
   (This has to be done after gitlab has successfully started)
   The Gitlab runner dispatcher boots new ec2 instances for running gitlab pipelines

After a branch is merged/deleted the Gitlab pipeline is used to delete the ec2 instance.


### Changing the machine size
Machines are recycled for the whole lifespan of a branch. Therefore, changing the machine the size
in the file `.gitlab-provision.yml`  does NOT automatically change the running machine.

WORKAROUND: In order to provision a different machine size,
the first push of a branch MUST already contain the desired ec2instance type.
If you have already worked on your branch, and need to upgrade during development,
currently, you need to change the name of your branch and push again.


### Networking
All the services defined in the _docker-compose.yml_ run as separate containers inside the docker network.
This means that they can talk to each other using local ULRS. The backend for example can access the local Gitlab instance **internally** via http://gitlab:80.

From the **outside** the addresses and ports are mapped a little bit differently.
The Gitlab instance is reachable directly at `http://ec-123-123-123-123..eu-central-1.compute.amazonaws.com:10080` (note the port number).
Please look at the _docker-compose.yml_ for the correct port numbers of the ther services


### HTTP Reverse Proxy
The _docker-compose.yml_ features **nginx** as reverse proxy running on port 80. One reason for this setup is, so that
we can route API calls to the Backend, Gitlab and other services through the same _orgign_ and preven CORS errors.


### Instance Maintenance
To connect to a development instance you will need either the IP or hostname of the instance.
This can be found in the [Environments Section](https://gitlab.com/mlreef/frontend/-/environments) on gitlab.com

You will also need the most current `KEYFILE` which contains the private key to authenticate with the ec2 instance

To login to the an instance located at `ec2-123-123-123-123.eu-central-1.compute.amazonaws.com` use the following command.

```bash
ssh -i KEYFILE ubuntu@ec2-123-123-123-123.eu-central-1.compute.amazonaws.com

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

# to follow the container log live:
docker logs $CONTAINER_NAME -f
```

Understanding Docker for development ENV
----------------------------------------
The systems relies on just one ENV variable which must be provided and must not have a default:

* ***GITLAB_ADMIN_TOKEN*** (secret and mandatory)
  * the Private Access Token (PTA) to access the gitlab container as gitlab admin
  * must not be changed after initialisation (without resetting gitlab)
  * must be provided to backend and gitlab
  * must not be used in the frontend

### Prelude

The scripts setup-loca-environment.sh/bat shall be helpful to setup your development environment. Unfortunately, docker-compose is quite complex and behaves differently on each machine.

Local individual issues can occur:

* different set env vars
* strange startup time of containers, i.e. gitlab container
* race conditions
* installed docker version
* cygwin installed in windows

Therefore, it is necessary that you understand the behavior and steps of the script, because you ought to do them manually!

### setup-local-environment.bat

Docker stops and kills containers and networks of the docker-compose.yml, but volumes are kept persistently!

```bash
docker-compose down
```

Ask docker to remove containers, networks and images, but again, persistant volumes are kept:

```bash
docker-compose rm -f -v -s
```

You have to explicitly remove a named volume. The script will remove your local persisted state of mlreef-frontend, it is clean now:

```bash
docker volume rm frontend_sock
docker volume rm frontend_gitlab-data
docker volume rm frontend_gitlab-runner-config
docker volume rm frontend_gitlab-runner-data
docker volume rm frontend_mlreefsql-data
docker volume rm frontend_postgresql-data
```

Start a docker-compose with --detach to still be able to use your terminal, when all those docker containers start:

```bash
docker-compose up --detach
# or
docker-compose up -d
```

Important: containers will start in the order of dependencies, but they might not wait for each other.

You can also (re)start a single container, all if dependencies have to be running or they will be (re)started aswell:

```bash
docker-compose up --detach single_container
```

Similar you can stop just one container. Dependent containers would then possible die or be stopped by docker! You have to watch your stack and restart them excplitcly, in the right order, and also with their individual waiting time:

```bash
docker-compose stop backend
```

When a container is running, you can advise docker to execute a command INSIDE of that container. Therefore, all the commands and scripts have to exist in the container or image already, there is no way of calling a non-existent script. The script would not stop the container after execution:

```bash
# executes setup-gitlab.sh which lies on the $PATH in gitlab-postgres container
docker exec -it gitlab-postgres setup-gitlab.sh
```

### Debugging docker, gitlab and backend

Those docker containers have different startup and waiting times, which can vary extremely on different machines!

* gitlab:
  * first start and setup: 2 to 5 minutes!
  * waits for the postgres database for ~20 seconds
  * further starts: ~20-30 seconds to restart with the persistend volume
* backend:
  * needs database and redis directly when starting
  * needs ~5-15 seconds to start Spring Boot
  * checks for the gitlab connection at ~ 0:15
  * cleans and inserts the initial test data at ~ 0:15
* postgres: ~5 seconds
* redis: ~2 seconds

The backend starts and checks for an available gitlab. If it cannot work due to persistent misconfiguration,
a crash will inform you about bad credentials (GITLAB_ADMIN_TOKEN) or a invalid GITLAB_ROOT_URL. In case of temporary communication failures,
the backend assumes the configuration would be working.

You can ask the backend how it feels:

Test if backend is reachable

```bash
curl "http://localhost:8080/api/v1/info/status" -i -X GET -H "Content-Type: application/json" -H "Accept: application/json"
```

Print out information about gitlab connection:

```bash
curl "http://localhost:8080/api/v1/info/health" -i -X GET -H "Content-Type: application/json" -H "Accept: application/json"
```

***Important***:

* If there is a invasive SQL execution (CREATE, DROP, INSERT, TRUNCATE) during the setup of gitlab, gitlab dies in pain!
  * do not run those SQL scripts when gitlab is migrating
  * watch out for the state of gitlab
  * restart and look in logs if it dies constantly
* backend constraints
  * the backend needs a working gitlab to operate!
  * Therefore, the backend will throw errors
  * if it *cannot work NEVER* (with the current config), so it **DIE**s and you have to fix the config
  * if the gitlab is not working or not available just *AT THE MOMENT*, then the backend *cannot work NOW*, but it will not die.
  * If you see some errors and backend lives: Wait for gitlab. restart those containers conciously and fix timing issues (502, 500, 400 http errors)
  * If you see some errors and backend dies with FATAL:
    * Gitlab is broken, fix those admin tokens
    * Gitlab root url is wrong, fix it
    * You will see a "403" in those cases.

### DataPopulator creates test data

This step is actually not needed for working, but useful as it creates a demo user and some repositories.

* This will just work, if gitlab is available during boot ;)
* data population is started when you run backend in "dev" or "docker" environment
* this will be changed and refactored soon; it was just meant to have a demo user now


### Explanation of ENV variables
As we are in development for pre-alpha: Set GITLAB_ADMIN_TOKEN is sufficent.

More ENV vars can be used for local adaption, development and debugging:

* GITLAB_ROOT_URL (optional)
  * may default to "http://gitlab:80" but could be provided anyway in the backend
* GITLAB_SECRETS_DB_KEY_BASE (should be: secret, mandatory)
  * use the same salt for gitlab and for gitlab-postgres
  * salt for encryption: **must not be changed after initialisation!**
  * currently "long-and-random-alphanumeric-string" is used for dev env
* SPRING_PROFILES_ACTIVE (optional defined)
  * default "docker"
  * provides useful defaults for GITLAB_ROOT_URL and logging output
  * provide "docker" for docker development env: less logging, recreates the database
  * provide "dev" for development env: much logging, recreates the database
  * provide "test" for testing: uses testcontainers instead of docker services for tests
  * provide "prod" for testing: less logging  


```bash
# restart the frontend
docker-compose up -d gateway
```


#### Attention: 2nd Proxy for local dev environment
There is a middleware proxy in setupProxy.js to proxy during development (does not need nginx-proxy)

This is meant as a helper for frontend developers and a work-in-progress.

To stop the nginx-proxy run this:

```bash
cd frontend/
docker stop nginx-proxy
cd web/
npm start
```

#### Register additional test users

As registration is not implemented in the frontend yet, a user must be registered via backend REST-service.
This requirement will vanish, as we are working on a better way to populate with test data.

This is not necessary now, as the backend creates a user when started in "dev" or "docker" spring environment

```bash
   curl 'http://localhost:8080/api/v1/auth/register' -i -X POST \
       -H 'Content-Type: application/json' \
       -H 'Accept: application/json' \
       -d '{
     "username" : "mlreef",
     "email" : "mlreef-demo@example.org",
     "password" : "password",
     "name" : "name"
   }'
   ```
### Troubleshooting
1. Gitlab shows 422 Error code in browser

This error was seen on the next PC configuration
* Firefox 71
* Windows 10
* Docker 19.03.8

The point of this error that you are not able neither login nor create a user in browser after your all services are up and running
At the moment when Firefox shows the error 422 (Unprocessible entity) Chrome works and allows to login.
The problem is in Docker and running containers and that date in containers is incorrect. You need to check date executing command
```docker exec -it postgresql sh```. It will open a window with terminal. Here in you need to type ```date``` and it'll show you
the date in this container. Most probably it will be incorrect.

To fix it you just need to down all containers (not mandatory) and restart Docker service
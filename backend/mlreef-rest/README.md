# MLReef REST Backend

## System-Tests

MLREEF_BACKEND_URL=http://localhost:8080
GITLAB_ROOT_URL=http://localhost:10080
GITLAB_ADMIN_TOKEN=local-api-token

## Debug connection

```bash
curl 'http://localhost:8080/api/v1/info/status' -i -X GET     -H 'Content-Type: application/json'    -H 'Accept: application/json' 
```

```bash
curl 'http://localhost:8080/api/v1/info/health' -i -X GET     -H 'Content-Type: application/json'    -H 'Accept: application/json' 
```

```bash
curl 'http://localhost:8080/api/v1/info/whoami' -i -X GET     -H 'Content-Type: application/json'    -H 'Accept: application/json' 
```

## Environment

The non-secret variables should go directly into the config files.
Other non-secret env variables may be used as switches and should provide a default values.
Other env vars are totally secret and should never go into the git repo, for example API keys, tokens and passwords.

This will be provided by GitlabCI, you local env (you have to setup this yourself), test envs or AWS.

Common prefixes are:
* JAVA_TEST_ := just used in Tests, can be provided via IDE run config

### Environment Variables

Provide ENV vars for testing (backend <-> EPF communication <-> Gitlab)

* GITLAB_ADMIN_TOKEN=local-api-token;
* EPF_BACKEND_URL=http://172.18.0.1:8080;
* EPF_IMAGE_TAG=feature-hotfix-stuff;
* EPF_GITLAB_URL=http://172.18.0.1:10080

* **GITLAB_ROOT_URL** 
  * root url of gitlab service to be used by backend, 
  * default: "http://localhost:10080"
* **GITLAB_ADMIN_TOKEN** 
  * The PTA of the Admin user with API and SUDO rights. keep it secret!
* **SPRING_PROFILES_ACTIVE** 
  * MUST BE provided! 
  * "dev", "test",  or "prod"
* DB_HOST = localhost on machine, "postgres" in gitlab ci
* DB_PORT = 6000
* DB_NAME = mlreef_backend
* DB_USER = mlreef
* DB_PASSWORD = guess
* REDIS_HOST = "localhost" on machine, "redis" in gitlab ci
* REDIS_PORT = 6379

Variables with* have no default and must be provided
  
### Needed Services

* Redis on port 6379
* postgres on port 6000 with database "mlreef_backend"
* gitlab-docker or gitlab.com

For docker-compose, you could say it ...

```
    depends_on:
      - gitlab
      - mlreef-postgres #6000
      - redis
```

## Development & Testing


### Prepare your environment:

* start docker-compose up in frontend project
* use docker image "mlreef-rest" at 8080 or explicitly kill it to run the backend with your IDE
* for manipulating redis sessions:
  * start a redis-cli and type:
  * ```FLUSH ALL``` to delete all sessions
  * ```KEY spring*``` to see all current (Spring session) keys 
* Create a bash/batch file to prepare you environment with the needed env vars. See [init-test-env-windows.bat.example](init-test-env-windows.bat.example)

### Run as standalone docker container

Run in production mode

```
docker run -d -p 8080:8080 --name backend registry.gitlab.com/mlreef/backend:latest
```

Run in "develop" mode by using the Spring profile called `dev`

```
docker run -d -p 8080:8080 -e "SPRING_PROFILES_ACTIVE=dev" --name backend registry.gitlab.com/mlreef/backend:latest
```


####  Setup PostgreSQL DB 

Setup your ENV variables!

```
docker pull postgres:11-alpine
docker run --name postgres -p $DB_PORT:$DB_PORT -e POSTGRES_PASSWORD=$DB_PASSWORD -d postgres:11
# CREATE db coursedb
docker exec postgres psql -U postgres -c"CREATE DATABASE $DB_NAME" postgres
```

```
# for windows: 
docker run --name postgres -p %DB_PORT%:%DB_PORT% -e POSTGRES_PASSWORD=%DB_PASSWORD% -d postgres:11
docker exec mlreef-rest_postgres_1 psql -U postgres -c"CREATE DATABASE mlreef_backend" postgres
```

## Deploy as Docker Image

The Dockerfile builds the Backend as a "FROM openjdk" image.
Project must be build and have a populated build/dependency dir!

* GITLAB_ROOT_URL := root url of gitlab instance to be used by backend, default: "http://localhost:10080"
* GITLAB_ADMIN_TOKEN := The PTA of the Admin user with API and SUDO rights. keep it secret!

Run at least the following:

```
./gradlew :mlreef-rest:prepareDocker
docker build --pull --tag "$IMAGE_PATH" -f Dockerfile .   # $IMAGE_PATH via GitlabCI
```

### Tipps

#### Windows

Killing stale server:
```
netstat -ano | grep 8080
taskkill /F /PID 1
```

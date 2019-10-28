# MLReef REST Backend


## Development & Testing

Spring boot runs on its own and will bind to local port 8080. You may use it as a docker service, 
see the [Dockerfile](Dockerfile) for that.
Some services are needed, Redis now and PostgreSQL in future. [Docker-compose](docker-compose.yml) will setup the necessary machines 
and will be kept up to date

### Prepare your environment:

* start docker-compose
* use docker image "mlreef-rest" at 8080 or explicitly kill it to run the backend with your IDE
* for manipulating redis sessions:
  * start a redis-cli and type:
  * ```FLUSH ALL``` to delete all sessions
  * ```KEY spring*``` to see all current (Spring session) keys 
* Create a bash/batch file to prepare you environment with the needed env vars. See [init-test-env-windows.bat.example](init-test-env-windows.bat.example)

## Environment

The non-secret variables should go directly into the config files. Other non-secret env variables may be used as switches and should provide a default values.
Other env vars are totally secret and should never go into the git repo, for example API keys, tokens and passwords.

This will be provided by GitlabCI, you local env (you have to setup this yourself), test envs or AWS.

Common prefixes are:
* AWS_ := related to secret AWS configuration
* JAVA_ := necessary for the spring container or java during Runtime, providable via IDE run config, env or system vars.
* JAVA_TEST_ := just used in Tests, can be provided via IDE run config

### Variables

* JAVA_TEST_PRIVATE_TOKEN := Gitlab Private Token (API permissions) of User for test repos
  * will be injected by Gitlab CI
  * must be provided locally for tests
  
### Services

* Redis on port 6379

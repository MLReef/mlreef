@echo off

REM # start the compose file in detached mode
docker-compose down
docker-compose rm -f -v -s
docker volume rm frontend_sock
docker volume rm frontend_gitlab-data
docker volume rm frontend_gitlab-runner-config
docker volume rm frontend_gitlab-runner-data
docker volume rm frontend_mlreefsql-data
docker volume rm frontend_postgresql-data
echo.
docker volume ls
echo Tip: You CAN delete other unused volumes with: docker volume prune
echo.
echo.
echo Start inital setup
docker-compose up --detach

echo.
echo Wait: Gitlab is starting ...

FOR /L %%G IN (1,1,20) DO (
sleep 10
echo ... wait for "http://localhost:10080/admin/runners"
curl -f -X GET  "http://localhost:10080/admin/runners"
)


echo.
REM # 1. Manual Steps
echo Please perform the manual steps for setup:
echo Login with root:password into your local gitlab instance
echo Gitlab will need some time to start (try refreshing in your browser)
echo.
echo  1. go to url: http://localhost:10080/admin/runners and copy the runner-registration-token
echo    Paste the runner-registration-token here:

set /p token="Paste the runner-registration-token here:"

echo Run cygwin with token: bin/register-local-gitlab-runner.sh %token%
echo run this under windos: bin\register-local-gitlab-runner.bat %token%
echo Runner was registered successfully
echo.
echo.
echo 2. Inject known admin token
echo Creating the admin token with GITLAB_ADMIN_TOKEN: %GITLAB_ADMIN_TOKEN%
docker exec -it gitlab-postgres bash -c "chmod +x bin/setup-gitlab.sh"
docker exec -it gitlab-postgres setup-gitlab.sh

REM # 3. restart services
echo Restarting services after initial setup
docker-compose stop
docker-compose up --detach
echo Let backend wait for gitlab restart ...
sleep 15
docker-compose stop backend nginx-proxy frontend
sleep 45
docker-compose up --detach backend nginx-proxy frontend


echo.
echo Test connection for admin:
curl -f -I -X GET --header "Content-Type: application/json" --header "Accept: application/json" --header "PRIVATE-TOKEN: %GITLAB_ADMIN_TOKEN%" "localhost:20080/api/v1"
curl -f -I -X GET --header "Content-Type: application/json" --header "Accept: application/json" --header "PRIVATE-TOKEN: %GITLAB_ADMIN_TOKEN%" "localhost:10080/api/v4/users/1"

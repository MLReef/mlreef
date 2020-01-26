docker exec gitlab-runner-dispatcher ls -al  /etc/gitlab-runner/config.toml
docker exec gitlab-runner-dispatcher rm      /etc/gitlab-runner/config.toml
docker exec gitlab-runner-dispatcher ls -al  /etc/gitlab-runner/config.toml
docker exec gitlab-runner-dispatcher gitlab-runner register    --non-interactive                                            --url="http://gitlab:80/"                                    --docker-network-mode frontend_default                       --registration-token "%1"                                    --executor "docker"                                          --docker-image alpine:latest                                 --docker-volumes /var/run/docker.sock:/var/run/docker.sock   --description "local developer runner"                       --tag-list "docker"                                          --run-untagged="true"                                        --env "ENVIRONMENT_TEST_VARIABLE=foo-bar"                    --locked="false"                                             --access-level="not_protected"
echo Debug log the configuration file to the console
docker exec gitlab-runner-dispatcher cat     /etc/gitlab-runner/config.toml


#!/bin/bash

docker exec gitlab cat /var/log/configuration.log

docker exec gitlab tail -f /var/log/configuration.log

docker exec gitlab sh -c 'echo GITLAB_SECRETS_DB_KEY_BASE=$GITLAB_SECRETS_DB_KEY_BASE'

docker exec gitlab sh -c 'PGPASSWORD=$POSTGRES_PASSWORD psql -h $POSTGRES_SERVICE_HOST_NAME -U $DB_USER -d $DB_NAME -c "SELECT * FROM personal_access_tokens;"'

docker exec gitlab sh -c '
  token="QSnV-pwMPyXkMz1iZ7y2""$(echo -n "$GITLAB_SECRETS_DB_KEY_BASE" | cut -c1-32)"
  echo $token
  token_digest=$(echo "$token" | openssl sha256 -binary | base64)
  echo "gitlab-db-config $(date): Computed new token_digest: $token_digest"
'

docker exec -t gitlab bash -c '
  gitlab-rails runner -e production "puts Gitlab::CurrentSettings.current_application_settings.runners_registration_token"
'

#http://localhost:10080/help/administration/troubleshooting/gitlab_rails_cheat_sheet.md
docker exec -t gitlab bash -c '
  gitlab-rails runner -e production "User.find(1).personal_access_tokens.create(
  name: '"'"'apitoken'"'"',
  token_digest: Gitlab::CryptoHelper.sha256('"'"'xzPdxQ-JzacYS6AWvVZJ'"'"'),
  impersonation: false,
  scopes: [:api,:sudo]
)
"
'

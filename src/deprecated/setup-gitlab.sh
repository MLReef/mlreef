#!/bin/bash
echo Starting

while ! pg_isready -h localhost > /dev/null 2> /dev/null; do
   echo -en 'Waiting for postgres is ready...\n';
   sleep 5;
done;

echo "# Generating admin token digest"
echo "   GITLAB_ADMIN_TOKEN: $GITLAB_ADMIN_TOKEN "
echo "   GITLAB_SECRETS_DB_KEY_BASE: $GITLAB_SECRETS_DB_KEY_BASE"  #long-and-random-alphanumeric-string
salt=$(echo $GITLAB_SECRETS_DB_KEY_BASE | cut -c1-32)
echo "   -> limit salt to 32 bytes/chars: $salt"
token=$GITLAB_ADMIN_TOKEN$salt
echo "   -> run echo -n token | openssl sha256 -binary | base64 -"
token_digest=$(echo -n $token | openssl sha256 -binary | base64 -)
echo "   = created token_digest: $token_digest"
echo " "
echo " "

sql_truncate="TRUNCATE TABLE public.personal_access_tokens;"
sql_insert="INSERT INTO public.personal_access_tokens (id,user_id,\"name\",revoked,expires_at,created_at,updated_at,scopes,impersonation,token_digest) VALUES (1,1,'admin-api-token',false,NULL,'2019-12-10 12:08:42.553','2019-12-10 12:08:42.553','---
- api
- read_user
- read_repository
- write_repository
- sudo',false,'FQuUQXUpDuWJgNyTZLXw8ev7y1O66MbaoaF5JuQmr7w=');"
sql_update="UPDATE public.personal_access_tokens SET token_digest='$token_digest' WHERE id=1;"
sql_select="SELECT id,user_id,\"name\",created_at,impersonation,token_digest FROM public.personal_access_tokens;"

echo "############################################"
echo "Updating token: Next lines MUST have \"UPDATE 1\" otherwise there was an error"

# actually not needed: PGPASSWORD=$DB_PASS psql -U $DB_USER -h localhost -d $DB_NAME -c "$sql_truncate"
PGPASSWORD=$DB_PASS psql -U $DB_USER -h localhost -d $DB_NAME -c "$sql_insert"
PGPASSWORD=$DB_PASS psql -U $DB_USER -h localhost -d $DB_NAME -c "$sql_update"
exit_value=$?
PGPASSWORD=$DB_PASS psql -U $DB_USER -h localhost -d $DB_NAME -c "$sql_select"
if [ $exit_value -ne 0 ]
then
  echo "ERROR: SQL UPDATE was not successfull: $exit_value"
  PGPASSWORD=$DB_PASS psql -U $DB_USER -h localhost -d $DB_NAME -c "$sql_select"
  echo " Run commands manually:"
  echo "$sql_truncate"
  echo "$sql_insert"
  echo "$sql_update"
  echo "$sql_select"
else
  echo "SUCCESS"
fi
echo "############################################"



#PGPASSWORD=$DB_PASS psql -U $DB_USER -h localhost -d $DB_NAME -c "SELECT * FROM public.personal_access_tokens;"

# inside docker image : PGPASSWORD=$DB_PASS psql -U $DB_USER -h localhost -d $DB_NAME -c "SELECT * FROM public.personal_access_tokens;"
# outside docker image: PGPASSWORD=$DB_PASS psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -c "SELECT * FROM public.personal_access_tokens;"

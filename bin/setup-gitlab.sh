#!/bin/bash
echo "# Generating admin token digest"
echo "   GITLAB_ADMIN_TOKEN: $(echo $GITLAB_ADMIN_TOKEN | cut -c1-5)***"
echo "   GITLAB_SECRETS_DB_KEY_BASE: $(echo $GITLAB_SECRETS_DB_KEY_BASE | cut -c1-5)***"  #long-and-random-alphanumeric-string
salt=$(echo $GITLAB_SECRETS_DB_KEY_BASE | cut -c1-32)
echo "   -> limit salt to 32 bytes/chars: ***$(echo $salt | cut -c28-32)"
token=$GITLAB_ADMIN_TOKEN$salt
echo "   -> run echo -n token | openssl sha256 -binary | base64 -" 
token_digest=$(echo -n $token | openssl sha256 -binary | base64 -)
echo "   = created token_digest: $(echo $token_digest | cut -c1-5)***"
echo " "
echo " "
echo "############################################"
echo "Updating token: Next line MUST say \"UPDATE 1\" otherwise there was an error"
sql_update="UPDATE public.personal_access_tokens SET token_digest='$token_digest' WHERE id=1;"
PGPASSWORD=$DB_PASS psql -U $DB_USER -h localhost -d $DB_NAME -c "$sql_update"
echo "############################################"



#PGPASSWORD=$DB_PASS psql -U $DB_USER -h localhost -d $DB_NAME -c "SELECT * FROM public.personal_access_tokens;"

# inside docker image : PGPASSWORD=$DB_PASS psql -U $DB_USER -h localhost -d $DB_NAME -c "SELECT * FROM public.personal_access_tokens;"
# outside docker image: PGPASSWORD=$DB_PASS psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME -c "SELECT * FROM public.personal_access_tokens;"
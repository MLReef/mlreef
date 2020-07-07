#!/bin/sh
set -e
docker exec -t mlreef-postgres bash -c 'PGPASSWORD=$DB_PASS psql -d $DB_NAME -U$DB_USER -c " \
TRUNCATE TABLE public.flyway_schema_history CASCADE;
"'

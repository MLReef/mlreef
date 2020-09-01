#!/bin/sh
set -e
docker exec -t mlreefdb bash -c 'PGPASSWORD=password psql -d mlreef_backend -Umlreef -c " \
DROP TABLE IF EXISTS public.flyway_schema_history CASCADE;
"'

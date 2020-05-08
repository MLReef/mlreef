#!/bin/sh
set -e
docker exec -t mlreef-postgres bash -c 'PGPASSWORD=$DB_PASS psql -d $DB_NAME -U$DB_USER -c " \
DROP TABLE IF EXISTS public.marketplace_star CASCADE;
DROP TABLE IF EXISTS public.marketplace_entries_outputdatatype CASCADE;
DROP TABLE IF EXISTS public.marketplace_entries_inputdatatype CASCADE;
DROP TABLE IF EXISTS public.marketplace_link CASCADE;
DROP TABLE IF EXISTS public.marketplace_entries_tags CASCADE;
DROP TABLE IF EXISTS public.marketplace_tag CASCADE;
DROP TABLE IF EXISTS public.marketplace_entry CASCADE;
DROP TABLE IF EXISTS public.output_file CASCADE;
DROP TABLE IF EXISTS public.data_processor_instance CASCADE;
DROP TABLE IF EXISTS public.code_project CASCADE;
DROP TABLE IF EXISTS public.data_processor CASCADE;
DROP TABLE IF EXISTS public.file_location CASCADE;
DROP TABLE IF EXISTS public.experiment CASCADE;
DROP TABLE IF EXISTS public.parameter_instance CASCADE;
DROP TABLE IF EXISTS public.pipeline_config CASCADE;
DROP TABLE IF EXISTS public.pipeline_instance CASCADE;
DROP TABLE IF EXISTS public.account CASCADE;
DROP TABLE IF EXISTS public.account_token CASCADE;
DROP TABLE IF EXISTS public."membership" CASCADE;
DROP TABLE IF EXISTS public.subject CASCADE;
DROP TABLE IF EXISTS public.processor_parameter CASCADE;
DROP TABLE IF EXISTS public.data_project CASCADE;
"'

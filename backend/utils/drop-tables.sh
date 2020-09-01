#!/bin/sh
set -e
docker exec -t mlreefdb bash -c 'PGPASSWORD=password psql -d mlreef_backend -Umlreef -c " \
DROP TABLE IF EXISTS public.marketplace_star CASCADE;
DROP TABLE IF EXISTS public.project_outputdatatypes CASCADE;
DROP TABLE IF EXISTS public.project_inputdatatypes CASCADE;
DROP TABLE IF EXISTS public.output_file CASCADE;
DROP TABLE IF EXISTS public.data_processor_instance CASCADE;
DROP TABLE IF EXISTS public.processor_version CASCADE;
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
DROP TABLE IF EXISTS public.mlreef_project CASCADE;
DROP TABLE IF EXISTS public.data_project CASCADE;
DROP TABLE IF EXISTS public.email CASCADE;
DROP TABLE IF EXISTS public.projects_tags CASCADE;
DROP TABLE IF EXISTS public.experiment_input_files CASCADE;
DROP TABLE IF EXISTS public.pipeline_config_input_files CASCADE;
DROP TABLE IF EXISTS public.pipeline_instance_input_files CASCADE;
"'

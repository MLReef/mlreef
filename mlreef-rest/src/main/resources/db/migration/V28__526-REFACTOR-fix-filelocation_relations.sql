CREATE TABLE IF NOT EXISTS public.pipeline_instance_input_files
(
    data_instance_id uuid NOT NULL,
    file_location_id uuid NOT NULL
) WITH ( OIDS = FALSE )
  TABLESPACE pg_default;

ALTER TABLE public.pipeline_instance_input_files
    OWNER to mlreef;

ALTER TABLE public.pipeline_instance_input_files
    DROP CONSTRAINT IF EXISTS filelocation_pipelineinstance_data_instance_id_fkey;
ALTER TABLE public.pipeline_instance_input_files
    ADD CONSTRAINT filelocation_pipelineinstance_data_instance_id_fkey FOREIGN KEY (data_instance_id)
        REFERENCES public.pipeline_instance (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;
ALTER TABLE public.pipeline_instance_input_files
    DROP CONSTRAINT IF EXISTS filelocation_pipelineinstance_file_location_id_fkey;
ALTER TABLE public.pipeline_instance_input_files
    ADD CONSTRAINT filelocation_pipelineinstance_file_location_id_fkey FOREIGN KEY (file_location_id)
        REFERENCES public.file_location (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;



CREATE TABLE IF NOT EXISTS public.experiment_input_files
(
    experiment_id    uuid NOT NULL,
    file_location_id uuid NOT NULL
) WITH ( OIDS = FALSE )
  TABLESPACE pg_default;

ALTER TABLE public.experiment_input_files
    OWNER to mlreef;

ALTER TABLE public.experiment_input_files
    DROP CONSTRAINT IF EXISTS filelocation_experiment_experiment_id_fkey;
ALTER TABLE public.experiment_input_files
    ADD CONSTRAINT filelocation_experiment_experiment_id_fkey FOREIGN KEY (experiment_id)
        REFERENCES public.experiment (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;
ALTER TABLE public.experiment_input_files
    DROP CONSTRAINT IF EXISTS filelocation_experiment_file_location_id_fkey;
ALTER TABLE public.experiment_input_files
    ADD CONSTRAINT filelocation_experiment_file_location_id_fkey FOREIGN KEY (file_location_id)
        REFERENCES public.file_location (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;



CREATE TABLE IF NOT EXISTS public.pipeline_config_input_files
(
    pipeline_config_id uuid NOT NULL,
    file_location_id   uuid NOT NULL
) WITH ( OIDS = FALSE )
  TABLESPACE pg_default;

ALTER TABLE public.pipeline_config_input_files
    OWNER to mlreef;

ALTER TABLE public.pipeline_config_input_files
    DROP CONSTRAINT IF EXISTS filelocation_pipelineconfig_pipeline_config_id_fkey;
ALTER TABLE public.pipeline_config_input_files
    ADD CONSTRAINT filelocation_pipelineconfig_pipeline_config_id_fkey FOREIGN KEY (pipeline_config_id)
        REFERENCES public.pipeline_config (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;
ALTER TABLE public.pipeline_config_input_files
    DROP CONSTRAINT IF EXISTS filelocation_pipelineconfig_file_location_id_fkey;
ALTER TABLE public.pipeline_config_input_files
    ADD CONSTRAINT filelocation_pipelineconfig_file_location_id_fkey FOREIGN KEY (file_location_id)
        REFERENCES public.file_location (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;
ALTER TABLE public.file_location
    DROP CONSTRAINT IF EXISTS filelocation_experiment_experiment_id_fkey;

ALTER TABLE public.file_location
    ADD CONSTRAINT filelocation_experiment_experiment_id_fkey FOREIGN KEY (experiment_id)
        REFERENCES public.experiment (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.experiment
    ADD COLUMN IF NOT EXISTS data_pipeline_instance_id uuid,
    ADD COLUMN IF NOT EXISTS "name"                    character varying(255),
    ADD COLUMN IF NOT EXISTS slug                      character varying(255);

-- delete unused
ALTER TABLE public.data_processor_instance
    DROP CONSTRAINT IF EXISTS experiment_experiment_pre_processing_id_fkey;

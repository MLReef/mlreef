ALTER TABLE public.experiment
    DROP CONSTRAINT IF EXISTS data_processor_instance_experiment_processing_id_fkey RESTRICT;

ALTER TABLE public.experiment
    ADD CONSTRAINT data_processor_instance_experiment_processing_id_fkey FOREIGN KEY (experiment_processing_id)
        REFERENCES public.data_processor_instance(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE;
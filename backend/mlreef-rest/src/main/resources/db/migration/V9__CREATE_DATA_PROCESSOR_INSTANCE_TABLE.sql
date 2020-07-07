CREATE TABLE IF NOT EXISTS public.data_processor_instance
(
    id                            UUID NOT NULL,
    experiment_post_processing_id UUID,
    experiment_pre_processing_id  UUID,
    experiment_processing_id      UUID,
    name                          VARCHAR(255),
    parent_id                     UUID,
    slug                          VARCHAR(255),
    data_processor_id             UUID,
    data_processor_version        BIGINT,
    CONSTRAINT data_processor_instance_pkey PRIMARY KEY (id),
    CONSTRAINT experiment_experiment_pre_processing_id_fkey FOREIGN KEY (experiment_pre_processing_id)
        REFERENCES public.experiment (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT experiment_experiment_post_processing_id_fkey FOREIGN KEY (experiment_post_processing_id)
        REFERENCES public.experiment (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT data_processor_instance_parent_id_fkey FOREIGN KEY (parent_id)
        REFERENCES public.data_processor_instance (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT data_processor_data_processor_id_data_processor_version_fkey FOREIGN KEY (data_processor_id, data_processor_version)
        REFERENCES public.data_processor (id, version)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
)
    WITH (oids = false);

ALTER TABLE public.data_processor_instance
    OWNER TO mlreef;
CREATE TABLE IF NOT EXISTS public.output_file
(
    id                UUID NOT NULL,
    data_processor_id UUID,
    experiment_id     UUID,
    CONSTRAINT output_file_pkey PRIMARY KEY (id),
    CONSTRAINT data_processor_data_processor_id_fkey FOREIGN KEY (data_processor_id)
        REFERENCES public.data_processor (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT experiment_experiment_id_fkey FOREIGN KEY (experiment_id)
        REFERENCES public.experiment (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
)
    WITH (oids = false);

ALTER TABLE public.output_file
    OWNER TO mlreef;
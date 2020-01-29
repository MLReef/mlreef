CREATE TABLE IF NOT EXISTS public.parameter_instance
(
    id                         UUID NOT NULL,
    data_processor_instance_id UUID,
    name                       VARCHAR(255),
    type                       INTEGER,
    value                      VARCHAR(255),
    parameter_id               UUID,
    CONSTRAINT parameter_instance_pkey PRIMARY KEY (id),
    CONSTRAINT processor_parameter_parameter_id_fkey FOREIGN KEY (parameter_id)
        REFERENCES public.processor_parameter (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT data_processor_instance_data_processor_instance_id_fkey FOREIGN KEY (data_processor_instance_id)
        REFERENCES public.data_processor_instance (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
)
    WITH (oids = false);

ALTER TABLE public.parameter_instance
    OWNER TO mlreef;
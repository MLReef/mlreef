CREATE TABLE IF NOT EXISTS public.processor_parameter
(
    id                UUID    NOT NULL,
    data_processor_id UUID,
    default_value     VARCHAR(255),
    description       VARCHAR(1024),
    parameter_group   VARCHAR(255),
    name              VARCHAR(255),
    required          BOOLEAN NOT NULL,
    type              VARCHAR(255),
    CONSTRAINT processor_parameter_pkey PRIMARY KEY (id),
    CONSTRAINT data_processor_data_processor_id_fkey FOREIGN KEY (data_processor_id)
        REFERENCES public.data_processor (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
)
    WITH (oids = false);

ALTER TABLE public.processor_parameter
    OWNER TO mlreef;
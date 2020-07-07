CREATE TABLE IF NOT EXISTS public.data_processor
(
    processor_type   VARCHAR(31) NOT NULL,
    id               UUID        NOT NULL,
    created_at       TIMESTAMP WITHOUT TIME ZONE,
    updated_at       TIMESTAMP WITHOUT TIME ZONE,
    version          BIGINT,
    code_project_id  UUID,
    command          VARCHAR(255),
    description      VARCHAR(1024),
    input_data_type  VARCHAR(255),
    name             VARCHAR(255),
    output_data_type VARCHAR(255),
    slug             VARCHAR(255),
    type             INTEGER,
    visibility_scope VARCHAR(255),
    author_id        UUID,
    CONSTRAINT data_processor_pkey PRIMARY KEY (id),
    CONSTRAINT id_version_ukey UNIQUE (id, version),
    CONSTRAINT subject_author_id_fkey FOREIGN KEY (author_id)
        REFERENCES public.subject (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
)
    WITH (oids = false);

ALTER TABLE public.data_processor
    OWNER TO mlreef;
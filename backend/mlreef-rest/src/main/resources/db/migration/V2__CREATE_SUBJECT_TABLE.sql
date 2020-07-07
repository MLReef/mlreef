CREATE TABLE IF NOT EXISTS public.subject
(
    dtype      VARCHAR(31) NOT NULL,
    id         UUID        NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    version    BIGINT,
    name       VARCHAR(255),
    slug       VARCHAR(255),
    CONSTRAINT subject_pkey PRIMARY KEY (id)
)
    WITH (oids = false);

ALTER TABLE public.subject
    OWNER TO mlreef;
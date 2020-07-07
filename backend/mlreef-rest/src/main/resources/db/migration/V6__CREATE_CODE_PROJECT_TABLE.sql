CREATE TABLE IF NOT EXISTS public.code_project
(
    id              UUID NOT NULL,
    owner_id        UUID,
    slug            VARCHAR(255),
    url             VARCHAR(255),
    code_project_id UUID,
    created_at      TIMESTAMP WITHOUT TIME ZONE,
    updated_at      TIMESTAMP WITHOUT TIME ZONE,
    version         BIGINT,
    gitlab_group    VARCHAR(255),
    gitlab_id       INTEGER,
    gitlab_project  VARCHAR(255),
    name            VARCHAR(255),
    CONSTRAINT code_project_pkey PRIMARY KEY (id),
    CONSTRAINT data_processor_code_project_id_fkey FOREIGN KEY (code_project_id)
        REFERENCES public.data_processor (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
)
    WITH (oids = false);

ALTER TABLE public.code_project
    OWNER TO mlreef;
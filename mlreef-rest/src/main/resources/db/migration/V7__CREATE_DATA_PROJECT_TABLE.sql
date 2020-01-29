CREATE TABLE IF NOT EXISTS public.data_project
(
    id             UUID NOT NULL,
    gitlab_group   VARCHAR(255),
    gitlab_id      INTEGER,
    gitlab_project VARCHAR(255),
    owner_id       UUID,
    slug           VARCHAR(255),
    url            VARCHAR(255),
    created_at     TIMESTAMP WITHOUT TIME ZONE,
    updated_at     TIMESTAMP WITHOUT TIME ZONE,
    version        BIGINT,
    name           VARCHAR(255),
    CONSTRAINT data_project_pkey PRIMARY KEY (id)
)
    WITH (oids = false);

ALTER TABLE public.data_project
    OWNER TO mlreef;
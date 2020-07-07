CREATE TABLE IF NOT EXISTS public.mlreef_project
(
    id               UUID NOT NULL,
    owner_id         UUID,
    slug             VARCHAR(255),
    url              VARCHAR(255),
    code_project_id  UUID,
    created_at       TIMESTAMP WITHOUT TIME ZONE,
    updated_at       TIMESTAMP WITHOUT TIME ZONE,
    version          BIGINT,
    gitlab_namespace VARCHAR(255),
    gitlab_id        INTEGER,
    gitlab_path      VARCHAR(255),
    name             VARCHAR(255),
    CONSTRAINT mlreef_project_pkey PRIMARY KEY (id)
)
    WITH (oids = false);

ALTER TABLE public.mlreef_project
    OWNER TO mlreef;

ALTER TABLE public.mlreef_project
    ADD COLUMN IF NOT EXISTS gitlab_path_with_namespace varchar(255),
    ADD COLUMN IF NOT EXISTS PROJECT_TYPE               varchar(63),
    ADD COLUMN IF NOT EXISTS global_slug                character varying(64) COLLATE pg_catalog."default",
    ADD COLUMN IF NOT EXISTS stars_count                integer,
    ADD COLUMN IF NOT EXISTS description                character varying(10240) COLLATE pg_catalog."default",
    ADD COLUMN IF NOT EXISTS forks_count                integer,
    ADD COLUMN IF NOT EXISTS visibility_scope           character varying(255) COLLATE pg_catalog."default"
;

-- fix old constraints (data/code-project)

ALTER TABLE public.pipeline_config
    DROP CONSTRAINT IF EXISTS pipeline_config_data_project_id_fkey;
ALTER TABLE public.pipeline_config
    Add CONSTRAINT pipeline_config_data_project_id_fkey FOREIGN KEY (data_project_id)
        REFERENCES public."mlreef_project" (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE;

ALTER TABLE public.pipeline_instance
    DROP CONSTRAINT IF EXISTS pipeline_instance_data_project_id_fkey;
ALTER TABLE public.pipeline_instance
    Add CONSTRAINT pipeline_instance_data_project_id_fkey FOREIGN KEY (data_project_id)
        REFERENCES public."mlreef_project" (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE;

DROP TABLE IF EXISTS public.data_projects;
DROP TABLE IF EXISTS public.code_projects;

CREATE TABLE IF NOT EXISTS public.base_environments
(
    id                         UUID NOT NULL,
    title                      TEXT NOT NULL,
    docker_image               TEXT NOT NULL,
    description                TEXT,
    requirements               TEXT,
    machine_type               TEXT,
    sdk_version                TEXT,
    CONSTRAINT publish_environments_pkey PRIMARY KEY (id)
)
    WITH (oids = false);

ALTER TABLE public.base_environments
    OWNER TO mlreef;

ALTER TABLE public.base_environments
    DROP CONSTRAINT IF EXISTS base_environments_title_uidx;

ALTER TABLE public.base_environments
  ADD CONSTRAINT base_environments_title_uidx
    UNIQUE (title) NOT DEFERRABLE;

ALTER TABLE public.processor_version
    ADD COLUMN IF NOT EXISTS environment_id uuid,
    ADD COLUMN IF NOT EXISTS model_type TEXT,
    ADD COLUMN IF NOT EXISTS ml_category TEXT;

ALTER TABLE public.processor_version
    DROP COLUMN IF EXISTS base_environment;

ALTER TABLE public.processor_version
    DROP CONSTRAINT IF EXISTS base_environments_id_fkey;
ALTER TABLE public.processor_version
    ADD CONSTRAINT base_environments_id_fkey FOREIGN KEY (environment_id)
        REFERENCES public.base_environments (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
        NOT DEFERRABLE;

ALTER TABLE public.processor_version
    DROP CONSTRAINT IF EXISTS data_processor_id_processor_version_fkey;
ALTER TABLE public.processor_version
    ADD CONSTRAINT data_processor_id_processor_version_fkey FOREIGN KEY (data_processor_id)
        REFERENCES public.data_processor (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT DEFERRABLE;

ALTER TABLE public.data_processor
    DROP CONSTRAINT IF EXISTS code_project_Id_data_processor_fkey;
ALTER TABLE public.data_processor
    ADD CONSTRAINT code_project_Id_data_processor_fkey FOREIGN KEY (code_project_id)
        REFERENCES public.mlreef_project (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
        NOT DEFERRABLE;

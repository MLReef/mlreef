CREATE TABLE IF NOT EXISTS public.experiment
(
    id                       UUID NOT NULL,
    data_project_id          UUID,
    job_finished_at          TIMESTAMP WITHOUT TIME ZONE,
    job_started_at           TIMESTAMP WITHOUT TIME ZONE,
    job_updated_at           TIMESTAMP WITHOUT TIME ZONE,
    json_blob                VARCHAR(255),
    source_branch            VARCHAR(255),
    status                   VARCHAR(255),
    target_branch            VARCHAR(255),
    experiment_processing_id UUID,
    CONSTRAINT experiment_pkey PRIMARY KEY (id),
    CONSTRAINT data_project_data_project_id_fkey FOREIGN KEY (data_project_id)
        REFERENCES public.data_project (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
)
    WITH (oids = false);

ALTER TABLE public.experiment
    OWNER TO mlreef;
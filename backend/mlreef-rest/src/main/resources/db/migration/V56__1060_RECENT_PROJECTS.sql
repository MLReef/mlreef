CREATE TABLE IF NOT EXISTS public.recent_projects
(
    id          UUID NOT NULL,
    user_id     UUID,
    project_id  UUID,
    update_date TIMESTAMP WITHOUT TIME ZONE,
    operation   TEXT,
    CONSTRAINT recent_projects_pkey PRIMARY KEY (id),
    CONSTRAINT recent_projects_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.subject (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT recent_projects_project_id_fkey FOREIGN KEY (project_id)
        REFERENCES public.mlreef_project (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
);

ALTER TABLE public.mlreef_project
    ADD COLUMN IF NOT EXISTS forked_from_id UUID;

ALTER TABLE public.mlreef_project
    ADD CONSTRAINT mlreef_project_forked_from_id_fk FOREIGN KEY (forked_from_id)
        REFERENCES mlreef_project (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE;


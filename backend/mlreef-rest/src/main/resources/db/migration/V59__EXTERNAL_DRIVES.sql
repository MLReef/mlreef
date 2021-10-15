CREATE TABLE IF NOT EXISTS public.drives_external
(
    id          UUID NOT NULL,
    drive_type  TEXT NOT NULL,
    alias       TEXT NOT NULL,
    key_1       TEXT,
    key_2       TEXT,
    key_3       TEXT,
    key_4       TEXT,
    key_5       TEXT,
    owner_id    UUID NOT NULL,
    external_id TEXT,
    region_name TEXT,
    path        TEXT,
    mask        TEXT,
    CONSTRAINT drives_external_pkey PRIMARY KEY (id),
    CONSTRAINT drive_external_owner_id_alias_unique UNIQUE (owner_id, alias),
    CONSTRAINT drives_external_account_id_fkey FOREIGN KEY (owner_id)
        REFERENCES public.account (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
);

CREATE TABLE IF NOT EXISTS public.projects_drives_external
(
    project_id UUID NOT NULL,
    drive_id   UUID NOT NULL,
    CONSTRAINT projects_drives_external_pkey PRIMARY KEY (project_id, drive_id),
    CONSTRAINT projects_drives_external_project_id FOREIGN KEY (project_id)
        REFERENCES public.mlreef_project (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT projects_drives_external_drive_id FOREIGN KEY (drive_id)
        REFERENCES public.drives_external (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
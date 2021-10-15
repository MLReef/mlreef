CREATE TABLE IF NOT EXISTS public.file_purposes
(
    id               UUID             NOT NULL,
    purpose_name     TEXT             NOT NULL,
    description      TEXT,
    max_file_size    BIGINT DEFAULT 0 NOT NULL,
    file_ext_allowed TEXT,
    CONSTRAINT file_purposes_uidx UNIQUE (purpose_name),
    CONSTRAINT file_purposes_pkey PRIMARY KEY (id)
);

COMMENT ON COLUMN public.file_purposes.max_file_size IS 'In bytes';

CREATE TABLE IF NOT EXISTS public.mlreef_files
(
    id                 UUID             NOT NULL,
    owner_id           UUID,
    upload_time        TIMESTAMP WITHOUT TIME ZONE,
    storage_file_name  TEXT,
    original_file_name TEXT,
    file_format        TEXT,
    purpose_id         UUID,
    file_size          BIGINT DEFAULT 0 NOT NULL,
    upload_dir         TEXT             NOT NULL,
    description        TEXT,
    content            BYTEA,
    CONSTRAINT mlreef_files_storage_file_name_uidx UNIQUE (storage_file_name),
    CONSTRAINT mlreef_files_pkey PRIMARY KEY (id),
    CONSTRAINT mlreef_files_purpose_id_fk FOREIGN KEY (purpose_id)
        REFERENCES public.file_purposes (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT mlreef_files_owner_fk FOREIGN KEY (owner_id)
        REFERENCES public.account (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE
);

-------- MLReef Projects

ALTER TABLE public.mlreef_project
    ADD COLUMN IF NOT EXISTS cover_picture_id UUID;

ALTER TABLE public.mlreef_project
    DROP CONSTRAINT IF EXISTS mlreef_project_main_picture_id_fk;

ALTER TABLE public.mlreef_project
    ADD CONSTRAINT mlreef_project_main_picture_id_fk FOREIGN KEY (cover_picture_id)
        REFERENCES mlreef_files (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE;

-------- Accounts

ALTER TABLE public.account
    ADD COLUMN IF NOT EXISTS avatar_id UUID;

ALTER TABLE public.account
    DROP CONSTRAINT IF EXISTS account_avatar_id_fk;

ALTER TABLE public.account
    ADD CONSTRAINT account_avatar_id_fk FOREIGN KEY (avatar_id)
        REFERENCES mlreef_files (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE;



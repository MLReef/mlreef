CREATE TABLE IF NOT EXISTS public.account_external
(
    id                       UUID NOT NULL,
    oauth_client             TEXT NOT NULL,
    username                 TEXT,
    email                    TEXT,
    account_id               UUID NOT NULL,
    external_id              TEXT,
    repos_url                TEXT,
    access_token             TEXT,
    access_token_expires_at  TIMESTAMP WITHOUT TIME ZONE,
    refresh_token            TEXT,
    refresh_token_expires_at TIMESTAMP WITHOUT TIME ZONE,
    avatar_url               TEXT,
    avatar_downloaded        BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT account_external_pkey PRIMARY KEY (id),
    CONSTRAINT account_external_oauth_client_username_unique UNIQUE (oauth_client, external_id),
    CONSTRAINT account_external_account_id_fkey FOREIGN KEY (account_id)
        REFERENCES public.account (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
);

ALTER TABLE public.subject
    DROP CONSTRAINT IF EXISTS subject_name_unique RESTRICT;
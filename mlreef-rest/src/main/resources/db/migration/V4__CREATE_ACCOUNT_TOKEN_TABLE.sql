CREATE TABLE IF NOT EXISTS public.account_token
(
    id         UUID    NOT NULL,
    account_id UUID,
    active     BOOLEAN NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE,
    gitlab_id  INTEGER,
    revoked    BOOLEAN NOT NULL,
    token      VARCHAR(255),
    CONSTRAINT account_token_pkey PRIMARY KEY (id),
    CONSTRAINT token_ukey UNIQUE (token),
    CONSTRAINT account_account_id_fkey FOREIGN KEY (account_id)
        REFERENCES public.account (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
)
    WITH (oids = false);

ALTER TABLE public.account_token
    OWNER TO mlreef;
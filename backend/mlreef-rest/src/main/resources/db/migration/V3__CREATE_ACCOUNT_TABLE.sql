CREATE TABLE IF NOT EXISTS public.account
(
    id                 UUID NOT NULL,
    created_at         TIMESTAMP WITHOUT TIME ZONE,
    updated_at         TIMESTAMP WITHOUT TIME ZONE,
    version            BIGINT,
    bot_id             UUID,
    email              VARCHAR(255),
    gitlab_id          INTEGER,
    last_login         TIMESTAMP WITHOUT TIME ZONE,
    password_encrypted VARCHAR(255),
    username           VARCHAR(255),
    person_id          UUID,
    CONSTRAINT account_pkey PRIMARY KEY (id),
    CONSTRAINT subject_person_id_fkey FOREIGN KEY (person_id)
        REFERENCES public.subject (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
)
    WITH (oids = false);

ALTER TABLE public.account
    OWNER TO mlreef;
CREATE TABLE IF NOT EXISTS public.email
(
    id                 UUID NOT NULL,
    account_id         UUID,
    recipient_name     TEXT NOT NULL,
    recipient_email    TEXT NOT NULL,
    sender_email       TEXT,
    subject            TEXT NOT NULL,
    message            TEXT,
    scheduled_at       TIMESTAMP WITHOUT TIME ZONE,
    sent_at            TIMESTAMP WITHOUT TIME ZONE,
    parent_email_id    UUID,
    fail_messages      TEXT,
    created_at         TIMESTAMP WITHOUT TIME ZONE,
    updated_at         TIMESTAMP WITHOUT TIME ZONE,
    version            BIGINT,

    CONSTRAINT email_pkey PRIMARY KEY (id),
    CONSTRAINT email_account_id_fkey FOREIGN KEY (account_id)
        REFERENCES public.account (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE
)
    WITH (oids = false);

ALTER TABLE public.account
    OWNER TO mlreef;

ALTER TABLE public.account
	ADD COLUMN IF NOT EXISTS change_account_token            TEXT,
	ADD COLUMN IF NOT EXISTS change_account_token_created_at TIMESTAMP WITHOUT TIME ZONE;
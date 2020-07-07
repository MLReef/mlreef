-- Table: public.marketplace_tag

CREATE TABLE IF NOT EXISTS public.marketplace_tag
(
    id       uuid NOT NULL,
    name     character varying(64) COLLATE pg_catalog."default",
    owner_id uuid,
    public   boolean,
    tag_type character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT marketplace_tag_pkey PRIMARY KEY (id)
)
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;

ALTER TABLE public.marketplace_tag
    OWNER to mlreef;


CREATE TABLE IF NOT EXISTS public.marketplace_entries_tags
(
    entry_id uuid NOT NULL,
    tag_id   uuid NOT NULL,
    CONSTRAINT marketplace_entries_tags_pkey PRIMARY KEY (entry_id, tag_id),
    CONSTRAINT marketplace_entries_tags_entry_id FOREIGN KEY (entry_id)
        REFERENCES public.marketplace_entry (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT marketplace_entries_tags_tag_id FOREIGN KEY (tag_id)
        REFERENCES public.marketplace_tag (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;

ALTER TABLE public.marketplace_entries_tags
    OWNER to mlreef;

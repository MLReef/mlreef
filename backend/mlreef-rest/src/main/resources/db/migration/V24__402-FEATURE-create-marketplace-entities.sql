CREATE TABLE IF NOT EXISTS public.marketplace_entry
(
    id              uuid                                               NOT NULL,
    description     character varying(4096) COLLATE pg_catalog."default",
    global_slug     character varying(64) COLLATE pg_catalog."default",
    owner_id        uuid,
    stars_count     integer,
    name            character varying(256) COLLATE pg_catalog."default",
    visibility      character varying(255) COLLATE pg_catalog."default",
    searchable_id   uuid                                               NOT NULL,
    searchable_type character varying(63) COLLATE pg_catalog."default" NOT NULL,

    CONSTRAINT marketplace_entry_pkey PRIMARY KEY (id),
    CONSTRAINT marketplace_entry_unique_name_owner UNIQUE (name, owner_id),
    CONSTRAINT marketplace_entry_unique_slug UNIQUE (global_slug)
)
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;

ALTER TABLE public.marketplace_entry
    OWNER to mlreef;

ALTER TABLE public.marketplace_entry
    DROP CONSTRAINT IF EXISTS marketplace_entry_subject_owner_id;
ALTER TABLE public.marketplace_entry
    ADD CONSTRAINT marketplace_entry_subject_owner_id FOREIGN KEY (owner_id)
        REFERENCES public.subject (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;


ALTER TABLE public.marketplace_entry
    DROP CONSTRAINT IF EXISTS marketplace_entry_unique_searchable_id;
ALTER TABLE public.marketplace_entry
    ADD CONSTRAINT marketplace_entry_unique_searchable_id UNIQUE (searchable_id);

CREATE TABLE IF NOT EXISTS public.marketplace_star
(
    entry_id   uuid NOT NULL,
    subject_id uuid NOT NULL,
    CONSTRAINT marketplace_star_pkey PRIMARY KEY (entry_id, subject_id)
)
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;

ALTER TABLE public.marketplace_star
    OWNER to mlreef;

ALTER TABLE public.marketplace_star
    DROP CONSTRAINT IF EXISTS marketplace_star_subject_subject_id;
ALTER TABLE public.marketplace_star
    ADD CONSTRAINT marketplace_star_subject_subject_id FOREIGN KEY (subject_id)
        REFERENCES public.subject (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.marketplace_star
    DROP CONSTRAINT IF EXISTS marketplace_star_entry_entry_id;
ALTER TABLE public.marketplace_star
    ADD CONSTRAINT marketplace_star_entry_entry_id FOREIGN KEY (entry_id)
        REFERENCES public.marketplace_entry (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;


CREATE TABLE IF NOT EXISTS public.marketplace_entries_outputdatatype
(
    entry_id        uuid NOT NULL,
    output_datatype character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT marketplace_entries_outputdatatype_entry_id FOREIGN KEY (entry_id)
        REFERENCES public.marketplace_entry (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;

ALTER TABLE public.marketplace_entries_outputdatatype
    OWNER to mlreef;


CREATE TABLE IF NOT EXISTS public.marketplace_entries_inputdatatype
(
    entry_id       uuid NOT NULL,
    input_datatype character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT marketplace_entries_inputdatatype_entry_id FOREIGN KEY (entry_id)
        REFERENCES public.marketplace_entry (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;

ALTER TABLE public.marketplace_entries_inputdatatype
    OWNER to mlreef;



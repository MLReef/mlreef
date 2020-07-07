CREATE TABLE IF NOT EXISTS public.membership
(
    id        UUID NOT NULL,
    group_id  UUID,
    person_id UUID,
    CONSTRAINT membership_pkey PRIMARY KEY (id),
    CONSTRAINT subject_group_id_fkey FOREIGN KEY (group_id)
        REFERENCES public.subject (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT subject_person_id_fkey FOREIGN KEY (person_id)
        REFERENCES public.subject (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
)
    WITH (oids = false);

ALTER TABLE public.membership
    OWNER TO mlreef;
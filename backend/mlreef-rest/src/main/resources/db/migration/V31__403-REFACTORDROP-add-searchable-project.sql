-- marketplace entry in project
ALTER TABLE public.mlreef_project
    ADD COLUMN IF NOT EXISTS "document" tsvector
;

-- Migrate null Data, but should stay nullable
UPDATE public.mlreef_project
SET document = to_tsvector(name || '. ' || description)
WHERE document IS NULL;

DROP INDEX IF EXISTS project_fts_index;
CREATE INDEX project_fts_index ON public.mlreef_project USING gin (document);


ALTER TABLE public.marketplace_star
    DROP CONSTRAINT IF EXISTS marketplace_star_subject_subject_id;
ALTER TABLE public.marketplace_star
    DROP CONSTRAINT IF EXISTS marketplace_star_entry_entry_id;
ALTER TABLE public.marketplace_entries_outputdatatype
    DROP CONSTRAINT IF EXISTS marketplace_entries_outputdatatype_entry_id;
ALTER TABLE public.marketplace_entries_inputdatatype
    DROP CONSTRAINT IF EXISTS marketplace_entries_inputdatatype_entry_id;
ALTER TABLE public.marketplace_entries_tags
    DROP CONSTRAINT IF EXISTS marketplace_entries_tags_entry_id;



DROP TABLE IF EXISTS public.marketplace_entry;
DROP TABLE IF EXISTS public.marketplace_entries_outputdatatype;
DROP TABLE IF EXISTS public.marketplace_entries_inputdatatype;

DROP TABLE IF EXISTS public.marketplace_star;
CREATE TABLE IF NOT EXISTS public.marketplace_star
(
    project_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    CONSTRAINT marketplace_star_pkey PRIMARY KEY (project_id, subject_id)
)
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;

ALTER TABLE public.marketplace_star
    OWNER to mlreef;

ALTER TABLE public.marketplace_star
    DROP CONSTRAINT IF EXISTS marketplace_star_project_id;
ALTER TABLE public.marketplace_star
    ADD CONSTRAINT marketplace_star_project_id FOREIGN KEY (project_Id)
        REFERENCES public.mlreef_project (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;
ALTER TABLE public.marketplace_star
    DROP CONSTRAINT IF EXISTS marketplace_star_subject_id;
ALTER TABLE public.marketplace_star
    ADD CONSTRAINT marketplace_star_subject_id FOREIGN KEY (subject_id)
        REFERENCES public.subject (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;


DROP TABLE IF EXISTS public.marketplace_entries_tags;

CREATE TABLE IF NOT EXISTS public.projects_tags
(
    project_id uuid NOT NULL,
    tag_id     uuid NOT NULL,
    CONSTRAINT projects_tags_pkey PRIMARY KEY (project_id, tag_id),
    CONSTRAINT projects_tags_project_id FOREIGN KEY (project_id)
        REFERENCES public.mlreef_project (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT projects_tags_tag_id FOREIGN KEY (tag_id)
        REFERENCES public.marketplace_tag (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;

ALTER TABLE public.projects_tags
    OWNER to mlreef;

-- Trigger to update FTS
CREATE OR REPLACE FUNCTION update_fts_document() RETURNS TRIGGER AS
$$
BEGIN
    NEW.document := to_tsvector(NEW.name || '. ' || NEW.description);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_fts_document ON public.mlreef_project;
CREATE TRIGGER check_fts_document
    BEFORE UPDATE
    ON public.mlreef_project
    FOR EACH ROW
EXECUTE PROCEDURE update_fts_document();

ALTER TABLE public.processor_version
    ALTER COLUMN "publisher_id" drop NOT NULL
;

ALTER TABLE public.data_processor
    DROP CONSTRAINT IF EXISTS data_processor_slug_unique;
ALTER TABLE public.data_processor
    DROP CONSTRAINT IF EXISTS data_processor_author_slug_unique;
ALTER TABLE public.data_processor
    ADD CONSTRAINT data_processor_author_slug_unique UNIQUE (author_id, slug);

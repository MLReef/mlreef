ALTER TABLE public.processor_version
    ADD COLUMN IF NOT EXISTS gitlab_path TEXT COLLATE pg_catalog."default";

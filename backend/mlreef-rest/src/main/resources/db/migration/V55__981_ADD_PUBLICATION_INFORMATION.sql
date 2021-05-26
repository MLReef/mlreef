ALTER TABLE public.processors
    ADD COLUMN IF NOT EXISTS requirements_file_path TEXT;

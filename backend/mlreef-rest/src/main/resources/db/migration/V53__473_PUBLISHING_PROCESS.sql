ALTER TABLE public.processor_version
    ADD COLUMN IF NOT EXISTS publish_finished_at TIMESTAMP WITHOUT TIME ZONE;
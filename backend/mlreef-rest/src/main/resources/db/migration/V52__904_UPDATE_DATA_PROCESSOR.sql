ALTER TABLE public.processor_version
    ADD COLUMN IF NOT EXISTS content_sha_256 TEXT,
    ADD COLUMN IF NOT EXISTS publish_secret TEXT,
    ADD COLUMN IF NOT EXISTS publish_commit_sha TEXT;
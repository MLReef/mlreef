ALTER TABLE public.experiment
    DROP COLUMN IF EXISTS job_finished_at,
    DROP COLUMN IF EXISTS job_started_at,
    DROP COLUMN IF EXISTS job_updated_at;

ALTER TABLE public.experiment
    ADD COLUMN IF NOT EXISTS gitlab_commit_sha   character varying(100) COLLATE pg_catalog."default",
    ADD COLUMN IF NOT EXISTS gitlab_committed_at timestamp without time zone,
    ADD COLUMN IF NOT EXISTS gitlab_created_at   timestamp without time zone,
    ADD COLUMN IF NOT EXISTS gitlab_finished_at  timestamp without time zone,
    ADD COLUMN IF NOT EXISTS gitlab_id           bigint,
    ADD COLUMN IF NOT EXISTS gitlab_ref          character varying(100) COLLATE pg_catalog."default",
    ADD COLUMN IF NOT EXISTS gitlab_hash          character varying(32) COLLATE pg_catalog."default",
    ADD COLUMN IF NOT EXISTS gitlab_started_at   timestamp without time zone,
    ADD COLUMN IF NOT EXISTS gitlab_updated_at   timestamp without time zone;

ALTER TABLE public.pipeline_instance
    ADD COLUMN IF NOT EXISTS gitlab_commit_sha   character varying(100) COLLATE pg_catalog."default",
    ADD COLUMN IF NOT EXISTS gitlab_committed_at timestamp without time zone,
    ADD COLUMN IF NOT EXISTS gitlab_created_at   timestamp without time zone,
    ADD COLUMN IF NOT EXISTS gitlab_finished_at  timestamp without time zone,
    ADD COLUMN IF NOT EXISTS gitlab_id           bigint,
    ADD COLUMN IF NOT EXISTS gitlab_ref          character varying(100) COLLATE pg_catalog."default",
    ADD COLUMN IF NOT EXISTS gitlab_hash          character varying(32) COLLATE pg_catalog."default",
    ADD COLUMN IF NOT EXISTS gitlab_started_at   timestamp without time zone,
    ADD COLUMN IF NOT EXISTS gitlab_updated_at   timestamp without time zone;
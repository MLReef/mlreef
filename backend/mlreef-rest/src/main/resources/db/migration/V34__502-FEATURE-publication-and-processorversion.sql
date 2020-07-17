CREATE TABLE IF NOT EXISTS public.processor_version
(
    id                         uuid NOT NULL,
    data_processor_id          uuid NOT NULL,
    publisher_id               uuid NOT NULL,
    number                     integer,
    branch                     character varying(256) COLLATE pg_catalog."default",
    command                    character varying(255) COLLATE pg_catalog."default",
    base_environment           character varying(255) COLLATE pg_catalog."default",
    metric_schema_type         character varying(256) COLLATE pg_catalog."default",
    metric_schema_ground_truth character varying(256) COLLATE pg_catalog."default",
    metric_schema_prediction   character varying(256) COLLATE pg_catalog."default",
    metric_schema_json_blob    character varying(256) COLLATE pg_catalog."default",
    published_at               TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT processorversion_pkey PRIMARY KEY (id),
    CONSTRAINT processorversion_id_number UNIQUE (data_processor_id, number)
)
    WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;

ALTER TABLE public.processor_version
    ADD COLUMN IF NOT EXISTS gitlab_commit_sha   character varying(100) COLLATE pg_catalog."default",
    ADD COLUMN IF NOT EXISTS gitlab_committed_at timestamp without time zone,
    ADD COLUMN IF NOT EXISTS gitlab_created_at   timestamp without time zone,
    ADD COLUMN IF NOT EXISTS gitlab_finished_at  timestamp without time zone,
    ADD COLUMN IF NOT EXISTS gitlab_id           bigint,
    ADD COLUMN IF NOT EXISTS gitlab_ref          character varying(100) COLLATE pg_catalog."default",
    ADD COLUMN IF NOT EXISTS gitlab_hash         character varying(32) COLLATE pg_catalog."default",
    ADD COLUMN IF NOT EXISTS gitlab_started_at   timestamp without time zone,
    ADD COLUMN IF NOT EXISTS gitlab_updated_at   timestamp without time zone;

ALTER TABLE public.data_processor
    ADD COLUMN IF NOT EXISTS terms_accepted_by_id uuid,
    ADD COLUMN IF NOT EXISTS terms_accepted_at    TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS licence_name         character varying(256) COLLATE pg_catalog."default",
    ADD COLUMN IF NOT EXISTS licence_text         text,
    ADD COLUMN IF NOT EXISTS last_published_at    TIMESTAMP WITHOUT TIME ZONE
;


-- 0. Fix data
INSERT INTO public.processor_version
(id, data_processor_id, publisher_id, number,
 branch, command, base_environment,
 metric_schema_type,
 metric_schema_ground_truth, metric_schema_prediction,
 metric_schema_json_blob, published_at)
SELECT id,
       id,
       author_id,
       1,
       'master',
       command,
       'UNDEFINED',
       'UNDEFINED',
       metric_schema_ground_truth,
       metric_schema_prediction,
       metric_schema_json_blob,
       created_at
FROM public.data_processor;


-- 1. add new fields
ALTER TABLE public.processor_parameter
    ADD COLUMN IF NOT EXISTS processor_version_id uuid
;

ALTER TABLE public.data_processor_instance
    ADD COLUMN IF NOT EXISTS processor_version_id uuid
;

-- 2. Fix relations
UPDATE public.processor_parameter
SET processor_version_id = data_processor_id;

-- 2.2 Fix wrong enum type numeric -> String
UPDATE public.data_processor_instance
SET metric_schema_type = 'UNDEFINED';

-- 3. Add NEW constraints
ALTER TABLE public.processor_parameter
    DROP
        CONSTRAINT IF EXISTS data_processor_data_processor_id_fkey;

ALTER TABLE public.processor_parameter
    DROP CONSTRAINT IF EXISTS parameter_processorversion_data_processor_id_fkey;
ALTER TABLE public.processor_parameter
    ADD CONSTRAINT parameter_processorversion_data_processor_id_fkey FOREIGN KEY (processor_version_id)
        REFERENCES public.processor_version (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.data_processor_instance
    DROP CONSTRAINT IF EXISTS dataprocessorinstance_processorversion_processor_version_id_fkey;
ALTER TABLE public.data_processor_instance
    ADD CONSTRAINT dataprocessorinstance_processorversion_processor_version_id_fkey FOREIGN KEY (processor_version_id)
        REFERENCES public.processor_version (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

-- 4. Delete old fields
ALTER TABLE public.processor_parameter
    DROP COLUMN IF EXISTS data_processor_id
;


-- Cleanup DataProcessor
ALTER TABLE public.data_processor
    DROP COLUMN IF EXISTS command,
    DROP COLUMN IF EXISTS metric_schema_type,
    DROP COLUMN IF EXISTS metric_schema_ground_truth,
    DROP COLUMN IF EXISTS metric_schema_prediction,
    DROP COLUMN IF EXISTS metric_schema_json_blob
;

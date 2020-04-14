CREATE TABLE IF NOT EXISTS public."pipeline_config"
(
    id                    uuid NOT NULL,
    data_project_id       uuid,
    name                  varchar(255),
    pipeline_type         varchar(255),
    slug                  varchar(255),
    source_branch         varchar(255),
    target_branch_pattern varchar(255),
    CONSTRAINT pipeline_config_pkey PRIMARY KEY (id),
    CONSTRAINT pipeline_config_data_project_id_fkey FOREIGN KEY (data_project_id)
        REFERENCES public."data_project" (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE
)
    WITH (oids = false);

ALTER TABLE public."pipeline_config"
    OWNER TO mlreef;


CREATE TABLE IF NOT EXISTS public."pipeline_instance"
(
    id                 uuid NOT NULL,
    commit             varchar(255),
    data_project_id    uuid,
    name               varchar(255),
    number             int  NOT NULL,
    pipeline_config_id uuid,
    pipeline_type      varchar(255),
    slug               varchar(255),
    source_branch      varchar(255),
    status             varchar(255),
    target_branch      varchar(255),
    CONSTRAINT pipeline_instance_pkey PRIMARY KEY (id),
    CONSTRAINT pipeline_instance_data_project_id_fkey FOREIGN KEY (data_project_id)
        REFERENCES public."data_project" (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT pipeline_instance_pipeline_config_id_fkey FOREIGN KEY (pipeline_config_id)
        REFERENCES public."pipeline_config" (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE
)
    WITH (oids = false);


ALTER TABLE public.pipeline_instance
    OWNER TO mlreef;

ALTER TABLE public."code_project"
    ADD COLUMN IF NOT EXISTS gitlab_path_with_namespace varchar(255)
;

ALTER TABLE public.code_project
    DROP CONSTRAINT IF EXISTS code_project_subject_id_fkey RESTRICT;

ALTER TABLE public."code_project"
    ADD CONSTRAINT code_project_subject_id_fkey
        FOREIGN KEY (owner_id)
            REFERENCES public."subject" (id)
;

ALTER TABLE public."data_processor_instance"
    ADD COLUMN IF NOT EXISTS gitlab_path_with_namespace varchar(255),
    ADD COLUMN IF NOT EXISTS metric_schema_ground_truth varchar(100),
    ADD COLUMN IF NOT EXISTS metric_schema_prediction   varchar(100),
    ADD COLUMN IF NOT EXISTS metric_schema_json_blob    varchar(100),
    ADD COLUMN IF NOT EXISTS metric_schema_type         varchar(100),
    ADD COLUMN IF NOT EXISTS data_instance_id           uuid,
    ADD COLUMN IF NOT EXISTS pipeline_config_id         uuid;
;

ALTER TABLE public.data_processor_instance
    DROP CONSTRAINT IF EXISTS data_processor_instance_data_instance_id_fkey RESTRICT;

ALTER TABLE public.data_processor_instance
    DROP CONSTRAINT IF EXISTS data_processor_instance_pipeline_config_id_fkey RESTRICT;

ALTER TABLE public."data_processor_instance"
    ADD CONSTRAINT data_processor_instance_data_instance_id_fkey
        FOREIGN KEY (data_instance_id)
            REFERENCES public."pipeline_instance" (id)
;

ALTER TABLE public."data_processor_instance"
    ADD CONSTRAINT data_processor_instance_pipeline_config_id_fkey
        FOREIGN KEY (pipeline_config_id)
            REFERENCES public."pipeline_config" (id)
;


CREATE TABLE IF NOT EXISTS public."file_location"
(
    id                 uuid PRIMARY KEY NOT NULL,
    data_instance_id   uuid,
    experiment_id      uuid,
    location           varchar(255),
    location_type      int,
    pipeline_config_id uuid
)
;

ALTER TABLE public."file_location"
    OWNER TO mlreef;

ALTER TABLE public.file_location
    DROP CONSTRAINT IF EXISTS file_location_data_instance_id_fkey RESTRICT;

ALTER TABLE public.file_location
    DROP CONSTRAINT IF EXISTS file_location_pipeline_config_id_fkey RESTRICT;

ALTER TABLE public."file_location"
    ADD CONSTRAINT file_location_data_instance_id_fkey
        FOREIGN KEY (data_instance_id)
            REFERENCES "public"."pipeline_instance" (id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
            NOT DEFERRABLE,
    ADD CONSTRAINT file_location_pipeline_config_id_fkey
        FOREIGN KEY (pipeline_config_id)
            REFERENCES "public"."pipeline_config" (id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
            NOT DEFERRABLE
;


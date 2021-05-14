CREATE TABLE IF NOT EXISTS public.processor_types
(
    id   UUID NOT NULL,
    name TEXT,
    CONSTRAINT processor_types_pkey PRIMARY KEY (id),
    CONSTRAINT processor_types_name_udx UNIQUE (name)
);

ALTER TABLE public.processor_types
    OWNER TO mlreef;

CREATE TABLE IF NOT EXISTS public.data_types
(
    id   UUID NOT NULL,
    name TEXT,
    CONSTRAINT data_types_pkey PRIMARY KEY (id),
    CONSTRAINT data_types_name_udx UNIQUE (name)
);

ALTER TABLE public.data_types
    OWNER TO mlreef;

CREATE TABLE IF NOT EXISTS public.parameter_types
(
    id   UUID NOT NULL,
    name TEXT,
    CONSTRAINT parameter_types_pkey PRIMARY KEY (id),
    CONSTRAINT parameter_types_name_udx UNIQUE (name)
);

ALTER TABLE public.parameter_types
    OWNER TO mlreef;

CREATE TABLE IF NOT EXISTS public.metric_types
(
    id   UUID NOT NULL,
    name TEXT,
    CONSTRAINT metric_types_pkey PRIMARY KEY (id),
    CONSTRAINT metric_types_name_udx UNIQUE (name)
);

ALTER TABLE public.metric_types
    OWNER TO mlreef;

CREATE TABLE IF NOT EXISTS public.pipeline_types
(
    id   UUID NOT NULL,
    name TEXT,
    CONSTRAINT pipeline_types_pkey PRIMARY KEY (id),
    CONSTRAINT pipeline_types_name_udx UNIQUE (name)
);

ALTER TABLE public.pipeline_types
    OWNER TO mlreef;

--------------------------------------------------------- PROCESSORS

CREATE TABLE IF NOT EXISTS public.processors
(
    id                         UUID                        NOT NULL,
    code_project_id            UUID                        NOT NULL,
    published_by               UUID,
    name                       TEXT,
    slug                       TEXT,
    description                TEXT,
    branch                     TEXT                        NOT NULL,
    version                    TEXT,
    commit_sha                 TEXT,
    secret                     TEXT,
    main_script_path           TEXT                        NOT NULL,
    content_sha_256            TEXT,
    published_at               TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    job_started_at             TIMESTAMP WITHOUT TIME ZONE,
    job_finished_at            TIMESTAMP WITHOUT TIME ZONE,
    status                     TEXT                        NOT NULL,
    environment_id             UUID,
    metric_schema_type_id      UUID,
    metric_schema_ground_truth TEXT,
    metric_schema_prediction   TEXT,
    metric_schema_json_blob    TEXT,
    log                        TEXT,
    image_name                 TEXT,
    terms_accepted_by_id       UUID,
    terms_accepted_at          TIMESTAMP WITHOUT TIME ZONE,
    licence_name               TEXT,
    licence_text               TEXT,
    gitlab_pipeline_id         BIGINT,
    updated_times              BIGINT  DEFAULT 0           NOT NULL,
    republish                  BOOLEAN DEFAULT FALSE       NOT NULL,
    CONSTRAINT processor_pkey PRIMARY KEY (id),
    CONSTRAINT processor_project_branch_version_unique UNIQUE (code_project_id, branch, version),
    CONSTRAINT processor_project_slug_unique UNIQUE (slug),
    CONSTRAINT processor_base_environments_id_fkey FOREIGN KEY (environment_id)
        REFERENCES public.base_environments (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT processor_code_project_id_fkey FOREIGN KEY (code_project_id)
        REFERENCES public.mlreef_project (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT processor_metric_type_id_fkey FOREIGN KEY (metric_schema_type_id)
        REFERENCES public.metric_types (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT processor_published_by_fkey FOREIGN KEY (published_by)
        REFERENCES public.subject (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE
);

ALTER TABLE public.processors
    OWNER TO mlreef;

----------------------------------------------------------- PARAMETERS

CREATE TABLE IF NOT EXISTS public.parameters
(
    id              UUID                  NOT NULL,
    default_value   TEXT,
    description     TEXT,
    parameter_group TEXT,
    name            TEXT,
    required        BOOLEAN DEFAULT false NOT NULL,
    parameter_order INTEGER DEFAULT 1,
    processor_id    UUID,
    type_id         UUID,
    CONSTRAINT parameters_pkey PRIMARY KEY (id),
    CONSTRAINT parameters_processor_name_unique UNIQUE (name, processor_id),
    CONSTRAINT parameters_processor_order_unique UNIQUE (parameter_order, processor_id),
    CONSTRAINT parameters_processor_id_fk FOREIGN KEY (processor_id)
        REFERENCES public.processors (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT parameters_type_id_fk FOREIGN KEY (type_id)
        REFERENCES public.parameter_types (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE
);

ALTER TABLE public.parameters
    OWNER TO mlreef;
--------------------------------------------------- PIPELINE CONFIGURATION

CREATE TABLE IF NOT EXISTS public.pipeline_configurations
(
    id                    UUID NOT NULL,
    created_by            UUID,
    data_project_id       UUID,
    name                  TEXT,
    pipeline_type_id      UUID,
    slug                  TEXT,
    source_branch         TEXT,
    target_branch_pattern TEXT,
    CONSTRAINT pipeline_configurations_pkey PRIMARY KEY (id),
    CONSTRAINT pipeline_configurations_dataproject_id_slug_unique UNIQUE (data_project_id, slug),
    CONSTRAINT pipeline_configurations_data_project_id_fkey FOREIGN KEY (data_project_id)
        REFERENCES public.mlreef_project (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT pipeline_config_pipeline_type_id_fk FOREIGN KEY (pipeline_type_id)
        REFERENCES public.pipeline_types (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT pipeline_config_created_by_fk FOREIGN KEY (created_by)
        REFERENCES public.subject (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE
);

ALTER TABLE public.pipeline_configurations
    OWNER TO mlreef;
----------------------------------------------------------- PIPELINE

CREATE TABLE IF NOT EXISTS public.pipelines
(
    id                  UUID              NOT NULL,
    created_by          UUID,
    commit              TEXT,
    name                TEXT,
    number              INTEGER DEFAULT 1 NOT NULL,
    pipeline_config_id  UUID,
    pipeline_type_id    UUID,
    slug                TEXT,
    source_branch       TEXT,
    target_branch       TEXT,
    status              TEXT              NOT NULL,
    gitlab_id           BIGINT,
    gitlab_ref          TEXT,
    gitlab_hash         TEXT,
    gitlab_commit_sha   TEXT,
    gitlab_created_at   TIMESTAMP WITHOUT TIME ZONE,
    gitlab_committed_at TIMESTAMP WITHOUT TIME ZONE,
    gitlab_started_at   TIMESTAMP WITHOUT TIME ZONE,
    gitlab_updated_at   TIMESTAMP WITHOUT TIME ZONE,
    gitlab_finished_at  TIMESTAMP WITHOUT TIME ZONE,
    log                 TEXT,
    CONSTRAINT pipelines_pkey PRIMARY KEY (id),
    CONSTRAINT pipelines_pipeline_config_id_number_unique UNIQUE (pipeline_config_id, number),
    CONSTRAINT pipelines_pipeline_config_id_slug_unique UNIQUE (pipeline_config_id, slug),
    CONSTRAINT pipelines_pipeline_config_id_fkey FOREIGN KEY (pipeline_config_id)
        REFERENCES public.pipeline_configurations (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT pipelines_pipeline_type_id_fk FOREIGN KEY (pipeline_type_id)
        REFERENCES public.pipeline_types (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT pipeline_created_by_fk FOREIGN KEY (created_by)
        REFERENCES public.subject (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE
);

ALTER TABLE public.pipelines
    OWNER TO mlreef;

--------------------------------------------------- PROCESSOR INSTANCE

CREATE TABLE IF NOT EXISTS public.processor_instances
(
    id                            UUID NOT NULL,
    experiment_post_processing_id UUID,
    experiment_pre_processing_id  UUID,
    experiment_processing_id      UUID,
    name                          TEXT,
    parent_id                     UUID,
    slug                          TEXT,
    processor_id                  UUID NOT NULL,
    pipeline_id                   UUID,
    pipeline_config_id            UUID,
    command                       TEXT,
    log                           TEXT,
    CONSTRAINT processor_instance_pkey PRIMARY KEY (id),
    CONSTRAINT processor_instance_processor_id_fkey FOREIGN KEY (processor_id)
        REFERENCES public.processors (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT processor_instance_dataprocessorinstance_parent_id_fkey FOREIGN KEY (parent_id)
        REFERENCES public.processor_instances (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT processor_instance_pipelineconfig_pipeline_config_id_fkey FOREIGN KEY (pipeline_config_id)
        REFERENCES public.pipeline_configurations (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT processor_instance_pipelineinstance_data_instance_id_fkey FOREIGN KEY (pipeline_id)
        REFERENCES public.pipelines (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
);

ALTER TABLE public.processor_instances
    OWNER TO mlreef;

-------------------------------------------------------------- EXPERIMENTS

CREATE TABLE IF NOT EXISTS public.experiments
(
    id                    UUID              NOT NULL,
    data_project_id       UUID,
    created_by            UUID,
    json_blob             TEXT,
    source_branch         TEXT,
    target_branch         TEXT,
    status                TEXT              NOT NULL,
    processor_instance_id UUID,
    pipeline_id           UUID,
    name                  TEXT,
    slug                  TEXT,
    gitlab_id             BIGINT,
    gitlab_commit_sha     TEXT,
    gitlab_ref            TEXT,
    gitlab_hash           TEXT,
    gitlab_committed_at   TIMESTAMP WITHOUT TIME ZONE,
    gitlab_created_at     TIMESTAMP WITHOUT TIME ZONE,
    gitlab_finished_at    TIMESTAMP WITHOUT TIME ZONE,
    gitlab_started_at     TIMESTAMP WITHOUT TIME ZONE,
    gitlab_updated_at     TIMESTAMP WITHOUT TIME ZONE,
    number                INTEGER DEFAULT 1 NOT NULL,
    log                   TEXT,
    CONSTRAINT experiments_pkey PRIMARY KEY (id),
    CONSTRAINT experiments_dataproject_id_slug_unique UNIQUE (data_project_id, slug),
    CONSTRAINT experiments_project_number_unique UNIQUE (data_project_id, number),
    CONSTRAINT experiments_processor_instances_id_fkey FOREIGN KEY (processor_instance_id)
        REFERENCES public.processor_instances (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT experiments_dataproject_project_id_fkey FOREIGN KEY (data_project_id)
        REFERENCES public.mlreef_project (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT experiments_pipeline_id_fkey FOREIGN KEY (pipeline_id)
        REFERENCES public.pipelines (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT experiment_created_by_fk FOREIGN KEY (created_by)
        REFERENCES public.subject (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE
);

ALTER TABLE public.experiments
    OWNER TO mlreef;

ALTER TABLE processor_instances
    DROP CONSTRAINT IF EXISTS processor_instance_experiment_post_processing_id_fkey;

ALTER TABLE public.processor_instances
    ADD CONSTRAINT processor_instance_experiment_post_processing_id_fkey FOREIGN KEY (experiment_post_processing_id)
        REFERENCES experiments (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE;

------------------------------------------- PARAMETER INSTANCES

CREATE TABLE IF NOT EXISTS public.parameter_instances
(
    id                    UUID NOT NULL,
    processor_instance_id UUID,
    name                  TEXT,
    value                 TEXT,
    parameter_id          UUID,
    type_id               UUID,
    CONSTRAINT parameter_instances_pkey PRIMARY KEY (id),
    CONSTRAINT parameter_instances_parameter_id_fkey FOREIGN KEY (parameter_id)
        REFERENCES public.parameters (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT parameter_instances_processor_instance_id_fkey FOREIGN KEY (processor_instance_id)
        REFERENCES public.processor_instances (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
);

ALTER TABLE public.parameter_instances
    OWNER TO mlreef;

---------------------------------------------- PIPELINE CONFIG FILES
CREATE TABLE IF NOT EXISTS public.pipeline_configuration_files
(
    pipeline_config_id UUID NOT NULL,
    file_location_id   UUID NOT NULL,
    CONSTRAINT pipeline_configuration_location_id_fkey FOREIGN KEY (file_location_id)
        REFERENCES public.file_location (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT pipeline_configuration_pipeline_config_id_fkey FOREIGN KEY (pipeline_config_id)
        REFERENCES public.pipeline_configurations (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
);

ALTER TABLE public.pipeline_configuration_files
    OWNER TO mlreef;

------------------------------------------------ PIPELINES FILES

CREATE TABLE IF NOT EXISTS public.pipeline_files
(
    pipeline_id      UUID NOT NULL,
    file_location_id UUID NOT NULL,
    CONSTRAINT pipeline_files_pipeline_id_fkey FOREIGN KEY (pipeline_id)
        REFERENCES public.pipelines (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT filelocation_pipelineinstance_file_location_id_fkey FOREIGN KEY (file_location_id)
        REFERENCES public.file_location (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE NOT DEFERRABLE
);

ALTER TABLE public.pipeline_files
    OWNER TO mlreef;

--------------------------------------------------- EXPERIMENT FILES

CREATE TABLE IF NOT EXISTS public.experiment_files
(
    experiment_id    UUID NOT NULL,
    file_location_id UUID NOT NULL,
    CONSTRAINT filelocation_experiment_experiment_id_fkey FOREIGN KEY (experiment_id)
        REFERENCES public.experiments (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE,
    CONSTRAINT filelocation_experiment_file_location_id_fkey FOREIGN KEY (file_location_id)
        REFERENCES public.file_location (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
        NOT DEFERRABLE
);

ALTER TABLE public.experiment_files
    OWNER TO mlreef;

---------------------------------------------- PROJECT

ALTER TABLE public.mlreef_project
    ADD COLUMN IF NOT EXISTS model_type TEXT;

ALTER TABLE public.mlreef_project
    ADD COLUMN IF NOT EXISTS ml_category TEXT;

ALTER TABLE public.mlreef_project
    ADD COLUMN IF NOT EXISTS processor_type_id UUID;

ALTER TABLE mlreef_project
    DROP CONSTRAINT IF EXISTS mlreef_project_processor_type_fk;

ALTER TABLE public.mlreef_project
    ADD CONSTRAINT mlreef_project_processor_type_fk FOREIGN KEY (processor_type_id)
        REFERENCES processor_types (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE;

----------------------------------------------- INPUT/OUTPUT DATA TYPE

ALTER TABLE public.project_inputdatatypes
    ADD COLUMN IF NOT EXISTS data_type_id UUID;

ALTER TABLE project_inputdatatypes
    DROP CONSTRAINT IF EXISTS project_inputdatatypes_processor_type_fk;

ALTER TABLE public.project_inputdatatypes
    ADD CONSTRAINT project_inputdatatypes_processor_type_fk FOREIGN KEY (data_type_id)
        REFERENCES data_types (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE;

ALTER TABLE public.project_outputdatatypes
    ADD COLUMN IF NOT EXISTS data_type_id UUID;

ALTER TABLE project_outputdatatypes
    DROP CONSTRAINT IF EXISTS project_outputdatatypes_processor_type_fk;

ALTER TABLE public.project_outputdatatypes
    ADD CONSTRAINT project_outputdatatypes_processor_type_fk FOREIGN KEY (data_type_id)
        REFERENCES data_types (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE;

----------------------------------------------- OUTPUT FILE

ALTER TABLE public.output_file
    ADD COLUMN IF NOT EXISTS experiments_id UUID;

ALTER TABLE output_file
    DROP CONSTRAINT IF EXISTS output_file_experiments_id_fk;

ALTER TABLE public.output_file
    ADD CONSTRAINT output_file_experiments_id_fk FOREIGN KEY (experiments_id)
        REFERENCES experiments (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE;

ALTER TABLE public.output_file
    ADD COLUMN IF NOT EXISTS processor_id UUID;

ALTER TABLE output_file
    DROP CONSTRAINT IF EXISTS output_file_processor_id_fk;

ALTER TABLE public.output_file
    ADD CONSTRAINT output_file_processor_id_fk FOREIGN KEY (processor_id)
        REFERENCES processors (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
        NOT DEFERRABLE;

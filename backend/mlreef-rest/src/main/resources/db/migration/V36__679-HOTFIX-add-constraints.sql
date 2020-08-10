-- UNIQUE CONSTRAINTS Subject

ALTER TABLE public.subject
    DROP CONSTRAINT IF EXISTS subject_slug_unique;
ALTER TABLE public.subject
    ADD CONSTRAINT subject_slug_unique UNIQUE (slug);

ALTER TABLE public.subject
    DROP CONSTRAINT IF EXISTS subject_name_unique;
ALTER TABLE public.subject
    ADD CONSTRAINT subject_name_unique UNIQUE (dtype, name);

ALTER TABLE public.subject
    DROP CONSTRAINT IF EXISTS subject_gitlabId_unique;
ALTER TABLE public.subject
    ADD CONSTRAINT subject_gitlabId_unique UNIQUE (dtype, gitlab_id);

-- UNIQUE CONSTRAINTS Project

ALTER TABLE public.mlreef_project
    DROP CONSTRAINT IF EXISTS mlreef_project_gitlab_id_unique;
ALTER TABLE public.mlreef_project
    ADD CONSTRAINT mlreef_project_gitlab_id_unique UNIQUE (gitlab_id);

ALTER TABLE public.mlreef_project
    DROP CONSTRAINT IF EXISTS mlreef_project_global_slug_unique;
ALTER TABLE public.mlreef_project
    ADD CONSTRAINT mlreef_project_global_slug_unique UNIQUE (global_slug);

ALTER TABLE public.mlreef_project
    DROP CONSTRAINT IF EXISTS mlreef_project_owner_slug_unique;
ALTER TABLE public.mlreef_project
    ADD CONSTRAINT mlreef_project_owner_slug_unique UNIQUE (slug, owner_id);

ALTER TABLE public.mlreef_project
    DROP CONSTRAINT IF EXISTS mlreef_project_owner_slug_unique;
ALTER TABLE public.mlreef_project
    ADD CONSTRAINT mlreef_project_owner_slug_unique UNIQUE (slug, owner_id);

ALTER TABLE public.mlreef_project
    DROP CONSTRAINT IF EXISTS mlreef_project_gitlabPathWithNamespace_unique;
ALTER TABLE public.mlreef_project
    ADD CONSTRAINT mlreef_project_gitlabPathWithNamespace_unique UNIQUE (gitlab_path_with_namespace);

ALTER TABLE public.mlreef_project
    DROP CONSTRAINT IF EXISTS mlreef_project_gitlabPathNamespace_unique;
ALTER TABLE public.mlreef_project
    ADD CONSTRAINT mlreef_project_gitlabPathNamespace_unique UNIQUE (gitlab_namespace, gitlab_path);

-- UNIQUE CONSTRAINTS Experiment

ALTER TABLE public.experiment
    DROP CONSTRAINT IF EXISTS experiment_dataProjectId_slug_unique;
ALTER TABLE public.experiment
    ADD CONSTRAINT experiment_dataProjectId_slug_unique UNIQUE (data_project_id, slug);

-- UNIQUE CONSTRAINTS Pipeline

ALTER TABLE public.pipeline_config
    DROP CONSTRAINT IF EXISTS pipeline_config_dataProjectId_slug_unique;
ALTER TABLE public.pipeline_config
    ADD CONSTRAINT pipeline_config_dataProjectId_slug_unique UNIQUE (data_project_id, slug);

ALTER TABLE public.pipeline_instance
    DROP CONSTRAINT IF EXISTS pipeline_instance_pipelineConfigId_slug_unique;
ALTER TABLE public.pipeline_instance
    ADD CONSTRAINT pipeline_instance_pipelineConfigId_slug_unique UNIQUE (pipeline_config_id, slug);

ALTER TABLE public.pipeline_instance
    DROP CONSTRAINT IF EXISTS pipeline_instance_pipelineConfigId_number_unique;
ALTER TABLE public.pipeline_instance
    ADD CONSTRAINT pipeline_instance_pipelineConfigId_number_unique UNIQUE (pipeline_config_id, number);

-- UNIQUE CONSTRAINTS DataProcessor

ALTER TABLE public.data_processor
    DROP CONSTRAINT IF EXISTS data_processor_slug_unique;
ALTER TABLE public.data_processor
    ADD CONSTRAINT data_processor_slug_unique UNIQUE (slug);

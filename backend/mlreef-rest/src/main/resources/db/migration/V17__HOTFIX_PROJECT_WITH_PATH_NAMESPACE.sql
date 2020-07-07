ALTER TABLE public.data_project
    ADD COLUMN IF NOT EXISTS gitlab_path_with_namespace varchar(255)
;

ALTER TABLE public.data_processor_instance
    ADD COLUMN IF NOT EXISTS command varchar(255)
;

ALTER TABLE public.membership
    DROP CONSTRAINT IF EXISTS subject_group_id_fkey;
ALTER TABLE public.membership
    DROP CONSTRAINT IF EXISTS subject_person_id_fkey;

ALTER TABLE public.membership
    DROP CONSTRAINT IF EXISTS membership_group_group_id_fkey;
ALTER TABLE public.membership
    ADD CONSTRAINT membership_group_group_id_fkey FOREIGN KEY (group_id)
        REFERENCES public.subject (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.membership
    DROP CONSTRAINT IF EXISTS membership_person_person_id_fkey;
ALTER TABLE public.membership
    ADD CONSTRAINT membership_person_person_id_fkey FOREIGN KEY (person_id)
        REFERENCES public.subject (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;



ALTER TABLE public.code_project
    DROP CONSTRAINT IF EXISTS data_processor_code_project_id_fkey;

ALTER TABLE public.code_project
    DROP CONSTRAINT IF EXISTS codeproject_dataprocessor_code_project_id_fkey;
ALTER TABLE public.code_project
    ADD CONSTRAINT codeproject_dataprocessor_code_project_id_fkey FOREIGN KEY (code_project_id)
        REFERENCES public.data_processor (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.code_project
    DROP CONSTRAINT IF EXISTS codeproject_subject_owner_id_fkey;
ALTER TABLE public.code_project
    ADD CONSTRAINT codeproject_subject_owner_id_fkey FOREIGN KEY (owner_id)
        REFERENCES public.subject (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.data_project
    DROP CONSTRAINT IF EXISTS dataproject_subject_owner_id_fkey;
ALTER TABLE public.data_project
    ADD CONSTRAINT dataproject_subject_owner_id_fkey FOREIGN KEY (owner_id)
        REFERENCES public.subject (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;



ALTER TABLE public.file_location
    DROP CONSTRAINT IF EXISTS file_location_data_instance_id_fkey;
ALTER TABLE public.file_location
    DROP CONSTRAINT IF EXISTS file_location_pipeline_config_id_fkey;

ALTER TABLE public.file_location
    DROP CONSTRAINT IF EXISTS filelocation_pipelineconfig_pipeline_config_id_fkey;
ALTER TABLE public.file_location
    ADD CONSTRAINT filelocation_pipelineconfig_pipeline_config_id_fkey FOREIGN KEY (pipeline_config_id)
        REFERENCES public.pipeline_config (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.file_location
    DROP CONSTRAINT IF EXISTS filelocation_pipelineinstance_data_instance_id_fkey;
ALTER TABLE public.file_location
    ADD CONSTRAINT filelocation_pipelineinstance_data_instance_id_fkey FOREIGN KEY (data_instance_id)
        REFERENCES public.pipeline_instance (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;



ALTER TABLE public.data_processor_instance
    DROP CONSTRAINT IF EXISTS data_processor_data_processor_id_data_processor_version_fkey;
ALTER TABLE public.data_processor_instance
    DROP CONSTRAINT IF EXISTS data_processor_instance_data_instance_id_fkey;
ALTER TABLE public.data_processor_instance
    DROP CONSTRAINT IF EXISTS data_processor_instance_parent_id_fkey;
ALTER TABLE public.data_processor_instance
    DROP CONSTRAINT IF EXISTS data_processor_instance_pipeline_config_id_fkey;
ALTER TABLE public.data_processor_instance
    DROP CONSTRAINT IF EXISTS experiment_experiment_post_processing_id_fkey;

ALTER TABLE public.data_processor
    DROP CONSTRAINT IF EXISTS id_version_ukey;
ALTER TABLE public.data_processor
    DROP CONSTRAINT IF EXISTS subject_author_id_fkey;

ALTER TABLE public.data_processor
    DROP CONSTRAINT IF EXISTS dataprocessor_subject_author_id_fkey;
ALTER TABLE public.data_processor
    ADD CONSTRAINT dataprocessor_subject_author_id_fkey FOREIGN KEY (author_id)
        REFERENCES public.subject (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.data_processor_instance
    DROP CONSTRAINT IF EXISTS dataprocessorinstance_dataprocessor_data_processor_id_fkey;
ALTER TABLE public.data_processor_instance
    ADD CONSTRAINT dataprocessorinstance_dataprocessor_data_processor_id_fkey FOREIGN KEY (data_processor_id)
        REFERENCES public.data_processor (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.data_processor_instance
    DROP CONSTRAINT IF EXISTS dataprocessorinstance_dataprocessorinstance_parent_id_fkey;
ALTER TABLE public.data_processor_instance
    ADD CONSTRAINT dataprocessorinstance_dataprocessorinstance_parent_id_fkey FOREIGN KEY (parent_id)
        REFERENCES public.data_processor_instance (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.data_processor_instance
    DROP CONSTRAINT IF EXISTS dataprocessorinstance_experiment_post_processing_id_fkey;
ALTER TABLE public.data_processor_instance
    ADD CONSTRAINT dataprocessorinstance_experiment_post_processing_id_fkey FOREIGN KEY (experiment_post_processing_id)
        REFERENCES public.experiment (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.data_processor_instance
    DROP CONSTRAINT IF EXISTS dataprocessorinstance_pipelineconfig_pipeline_config_id_fkey;
ALTER TABLE public.data_processor_instance
    ADD CONSTRAINT dataprocessorinstance_pipelineconfig_pipeline_config_id_fkey FOREIGN KEY (pipeline_config_id)
        REFERENCES public.pipeline_config (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.data_processor_instance
    DROP CONSTRAINT IF EXISTS dataprocessorinstance_pipelineinstance_data_instance_id_fkey;
ALTER TABLE public.data_processor_instance
    ADD CONSTRAINT dataprocessorinstance_pipelineinstance_data_instance_id_fkey FOREIGN KEY (data_instance_id)
        REFERENCES public.pipeline_instance (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;


ALTER TABLE public.parameter_instance
    DROP CONSTRAINT IF EXISTS data_processor_instance_data_processor_instance_id_fkey;
ALTER TABLE public.parameter_instance
    DROP CONSTRAINT IF EXISTS processor_parameter_parameter_id_fkey;

ALTER TABLE public.parameter_instance
    DROP CONSTRAINT IF EXISTS parameterinstance_processorparameter_parameter_id_fkey;
ALTER TABLE public.parameter_instance
    ADD CONSTRAINT parameterinstance_processorparameter_parameter_id_fkey FOREIGN KEY (parameter_id)
        REFERENCES public.processor_parameter (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.parameter_instance
    DROP CONSTRAINT IF EXISTS parameterinstances_data_processor_instance_id_fkey;
ALTER TABLE public.parameter_instance
    ADD CONSTRAINT parameterinstances_data_processor_instance_id_fkey FOREIGN KEY (data_processor_instance_id)
        REFERENCES public.data_processor_instance (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;


ALTER TABLE public.account
    DROP COLUMN IF EXISTS bot_id;
ALTER TABLE public.account
    DROP CONSTRAINT IF EXISTS subject_person_id_fkey;

ALTER TABLE public.account
    DROP CONSTRAINT IF EXISTS account_subject_person_id_fkey;
ALTER TABLE public.account
    ADD CONSTRAINT account_subject_person_id_fkey FOREIGN KEY (person_id)
        REFERENCES public.subject (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.experiment
    DROP CONSTRAINT IF EXISTS data_processor_instance_experiment_processing_id_fkey;
ALTER TABLE public.experiment
    DROP CONSTRAINT IF EXISTS data_project_data_project_id_fkey;

ALTER TABLE public.experiment
    DROP CONSTRAINT IF EXISTS dataprocessorinstance_experiment_processing_id_fkey;
ALTER TABLE public.experiment
    ADD CONSTRAINT dataprocessorinstance_experiment_processing_id_fkey FOREIGN KEY (experiment_processing_id)
        REFERENCES public.data_processor_instance (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.experiment
    DROP CONSTRAINT IF EXISTS experiment_dataproject_data_project_id_fkey;
ALTER TABLE public.experiment
    ADD CONSTRAINT experiment_dataproject_data_project_id_fkey FOREIGN KEY (data_project_id)
        REFERENCES public.data_project (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;


ALTER TABLE public.output_file
    DROP CONSTRAINT IF EXISTS data_processor_data_processor_id_fkey;
ALTER TABLE public.output_file
    DROP CONSTRAINT IF EXISTS experiment_experiment_id_fkey;

ALTER TABLE public.output_file
    DROP CONSTRAINT IF EXISTS outputfile_experiment_experiment_id_fkey;
ALTER TABLE public.output_file
    ADD CONSTRAINT outputfile_experiment_experiment_id_fkey FOREIGN KEY (experiment_id)
        REFERENCES public.experiment (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.output_file
    DROP CONSTRAINT IF EXISTS outputfiles_dataprocessor_data_processor_id_fkey;
ALTER TABLE public.output_file
    ADD CONSTRAINT outputfiles_dataprocessor_data_processor_id_fkey FOREIGN KEY (data_processor_id)
        REFERENCES public.data_processor (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;


ALTER TABLE public.account_token
    DROP CONSTRAINT IF EXISTS token_ukey;
ALTER TABLE public.account_token
    DROP CONSTRAINT IF EXISTS account_account_id_fkey;

ALTER TABLE public.account_token
    DROP CONSTRAINT IF EXISTS accounttoken_account_account_id_fkey;
ALTER TABLE public.account_token
    ADD CONSTRAINT accounttoken_account_account_id_fkey FOREIGN KEY (account_id)
        REFERENCES public.account (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;


ALTER TABLE public.processor_parameter
    DROP CONSTRAINT IF EXISTS data_processor_data_processor_id_fkey;

ALTER TABLE public.processor_parameter
    DROP CONSTRAINT IF EXISTS processorparameter_dataprocessor_data_processor_id_fkey;
ALTER TABLE public.processor_parameter
    ADD CONSTRAINT processorparameter_dataprocessor_data_processor_id_fkey FOREIGN KEY (data_processor_id)
        REFERENCES public.data_processor (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;



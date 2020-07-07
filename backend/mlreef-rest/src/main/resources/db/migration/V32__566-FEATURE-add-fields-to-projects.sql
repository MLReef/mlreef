CREATE TABLE IF NOT EXISTS public.project_inputdatatypes
(
    project_id     uuid NOT NULL,
    input_datatype character varying(100) COLLATE pg_catalog."default"
)
    WITH ( OIDS = FALSE )
    TABLESPACE pg_default;

ALTER TABLE public.project_inputdatatypes
    OWNER to mlreef;

ALTER TABLE public.project_inputdatatypes
    DROP CONSTRAINT IF EXISTS project_inputdatatypes_project_id;
ALTER TABLE public.project_inputdatatypes
    ADD CONSTRAINT project_inputdatatypes_project_id FOREIGN KEY (project_id)
        REFERENCES public.mlreef_project (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;


CREATE TABLE IF NOT EXISTS public.project_outputdatatypes
(
    project_id      uuid NOT NULL,
    output_datatype character varying(100) COLLATE pg_catalog."default"
)
    WITH ( OIDS = FALSE )
    TABLESPACE pg_default;

ALTER TABLE public.project_outputdatatypes
    OWNER to mlreef;

ALTER TABLE public.project_outputdatatypes
    DROP CONSTRAINT IF EXISTS project_outputdatatypes_project_id;
ALTER TABLE public.project_outputdatatypes
    ADD CONSTRAINT project_outputdatatypes_project_id FOREIGN KEY (project_id)
        REFERENCES public.mlreef_project (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;

ALTER TABLE public.experiment
    DROP CONSTRAINT IF EXISTS experiment_dataproject_data_project_id_fkey;
ALTER TABLE public.experiment
    DROP CONSTRAINT IF EXISTS experiment_dataproject_project_id_fkey;
ALTER TABLE public.experiment
    ADD CONSTRAINT experiment_dataproject_project_id_fkey FOREIGN KEY (data_project_id)
        REFERENCES public.mlreef_project (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE;
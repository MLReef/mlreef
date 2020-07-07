ALTER TABLE public.data_project
    ADD COLUMN IF NOT EXISTS visibility_scope character varying(255) COLLATE pg_catalog."default";

ALTER TABLE public.code_project
    ADD COLUMN IF NOT EXISTS visibility_scope character varying(255) COLLATE pg_catalog."default";


UPDATE data_project
SET visibility_scope = 'PUBLIC'
where visibility_scope is null
   or visibility_scope = '';
UPDATE code_project
SET visibility_scope = 'PUBLIC'
where visibility_scope is null
   or visibility_scope = '';
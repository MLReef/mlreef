DROP TABLE IF EXISTS public.data_project;
DROP TABLE IF EXISTS public.code_project;

-- Cleanup DataProcessor
ALTER TABLE public.mlreef_project
    DROP COLUMN IF EXISTS code_project_id
;

UPDATE public.data_processor
SET PROCESSOR_TYPE = 'VISUALIZATION'
WHERE PROCESSOR_TYPE = 'VISUALISATION'
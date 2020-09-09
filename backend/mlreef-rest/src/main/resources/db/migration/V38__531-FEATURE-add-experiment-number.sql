ALTER TABLE public.experiment
    ADD COLUMN "number" integer
;

ALTER TABLE public.experiment
    DROP CONSTRAINT IF EXISTS experiment_project_number_unique;
ALTER TABLE public.experiment
    ADD CONSTRAINT experiment_project_number_unique UNIQUE (data_project_id, number);

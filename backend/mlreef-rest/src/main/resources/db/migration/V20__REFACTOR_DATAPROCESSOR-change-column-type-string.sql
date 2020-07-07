ALTER TABLE public.data_processor
    ALTER COLUMN "type" TYPE varchar(100)
;

UPDATE public.data_processor
SET "type" = 'ALGORITHM'
where "type" = '0';
UPDATE public.data_processor
SET "type" = 'OPERATION'
where "type" = '1';
UPDATE public.data_processor
SET "type" = 'VISUALISATION'
where "type" = '2';

ALTER TABLE public.data_processor_instance
    ADD COLUMN IF NOT EXISTS "processor_type" varchar(100)
;

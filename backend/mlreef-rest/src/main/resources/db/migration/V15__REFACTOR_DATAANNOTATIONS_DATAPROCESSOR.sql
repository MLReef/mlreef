
ALTER TABLE public.data_processor
	ADD COLUMN IF NOT EXISTS metric_schema_type           varchar(100) ,
	ADD COLUMN IF NOT EXISTS metric_schema_ground_truth   varchar(100) ,
	ADD COLUMN IF NOT EXISTS metric_schema_prediction     varchar(100) ,
	ADD COLUMN IF NOT EXISTS metric_schema_json_blob      varchar(100) ;

ALTER TABLE public.processor_parameter
	ADD COLUMN IF NOT EXISTS parameter_order           INTEGER;


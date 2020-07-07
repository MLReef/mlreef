UPDATE public.project_inputdatatypes
SET input_datatype = 'ANY'
WHERE input_datatype IN ('NUMPY_ARRAY', 'SENSOR', 'NUMBER', 'TEXT', 'BINARY');

UPDATE public.project_outputdatatypes
SET output_datatype = 'ANY'
WHERE output_datatype IN ('NUMPY_ARRAY', 'SENSOR', 'NUMBER', 'TEXT', 'BINARY');

UPDATE public.data_processor
SET input_data_type = 'ANY'
WHERE input_data_type IN ('NUMPY_ARRAY', 'SENSOR', 'NUMBER', 'TEXT', 'BINARY');

UPDATE public.data_processor
SET output_data_type = 'ANY'
WHERE output_data_type IN ('NUMPY_ARRAY', 'SENSOR', 'NUMBER', 'TEXT', 'BINARY');

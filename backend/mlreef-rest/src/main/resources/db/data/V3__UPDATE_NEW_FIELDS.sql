UPDATE mlreef_project mp
SET processor_type_id = a.processor_type_id
FROM (
         SELECT dp.code_project_id as project_id, pt.id as processor_type_id
         FROM data_processor dp
                  join processor_types pt on dp.processor_type = pt.name
     ) a
where mp.id = a.project_id;

UPDATE mlreef_project
SET processor_type_id = E'94dafcdd-baed-4f8c-bcd2-de85be34b367'
WHERE processor_type_id is NULL;

UPDATE project_inputdatatypes idt
SET data_type_id = dt.id
FROM data_types dt
where idt.input_datatype = dt.name;

UPDATE project_outputdatatypes odt
SET data_type_id = dt.id
FROM data_types dt
where odt.output_datatype = dt.name;

UPDATE processor_parameter pp
SET type_id = pt.id
FROM parameter_types pt
where pp.type = pt.name;

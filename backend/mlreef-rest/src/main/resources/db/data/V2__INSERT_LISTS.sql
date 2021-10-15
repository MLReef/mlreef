INSERT INTO public.processor_types ("id", "name")
VALUES (E'dc178351-d524-449a-8360-8cd1d45daab0', E'VISUALIZATION');

INSERT INTO public.processor_types ("id", "name")
VALUES (E'94dafcdd-baed-4f8c-bcd2-de85be34b367', E'ALGORITHM');

INSERT INTO public.processor_types ("id", "name")
VALUES (E'47e897c4-0b9d-417b-bad9-55bc12492b99', E'OPERATION');

-- Data types

INSERT INTO public.data_types ("id", "name")
VALUES (E'16984180-c2ad-4128-a922-3608e1e8e120', E'NUMBER');

INSERT INTO public.data_types ("id", "name")
VALUES (E'ce3ef086-2215-4b28-892f-0aaae6fea62c', E'MODEL');

INSERT INTO public.data_types ("id", "name")
VALUES (E'4af99871-8853-4900-8fa4-b3a69120fb8c', E'VIDEO');

INSERT INTO public.data_types ("id", "name")
VALUES (E'20abfa07-6b99-45c6-9fcd-04eaff1b16bc', E'TIME_SERIES');

INSERT INTO public.data_types ("id", "name")
VALUES (E'2c143188-d741-489d-af6e-7982a5b6c576', E'TEXT');

INSERT INTO public.data_types ("id", "name")
VALUES (E'6fe7f41e-2c26-4e04-a495-0e3fbf6503ed', E'TABULAR');

INSERT INTO public.data_types ("id", "name")
VALUES (E'eaf75bfe-8952-4df0-905e-1ad8edfd1913', E'IMAGE');

INSERT INTO public.data_types ("id", "name")
VALUES (E'71fab3a4-f6e5-4c18-96d6-59c9cd016843', E'HIERARCHICAL');

INSERT INTO public.data_types ("id", "name")
VALUES (E'5774931c-dbc8-4f4d-8658-e1389671edc4', E'NONE');

INSERT INTO public.data_types ("id", "name")
VALUES (E'89fc5d19-ff8d-4dfb-8ffe-004d59f5ccf9', E'BINARY');

INSERT INTO public.data_types ("id", "name")
VALUES (E'032f45eb-03f7-47c9-89ce-ac356d704b1d', E'AUDIO');

INSERT INTO public.data_types ("id", "name")
VALUES (E'92bb8203-9332-4c84-af63-1f3ad2f144e4', E'ANY');

-- Parameter types

INSERT INTO public.parameter_types ("id", "name")
VALUES (E'0c7ba828-336f-4924-990e-5544514f6122', E'UNDEFINED');

INSERT INTO public.parameter_types ("id", "name")
VALUES (E'a04c5610-4742-4307-9be1-651c4287ff40', E'OBJECT');

INSERT INTO public.parameter_types ("id", "name")
VALUES (E'0b6faca7-b16f-4743-8eeb-4c51b4eb9659', E'DICTIONARY');

INSERT INTO public.parameter_types ("id", "name")
VALUES (E'2ea82a18-89c0-4532-9d3b-99a17721f957', E'TUPLE');

INSERT INTO public.parameter_types ("id", "name")
VALUES (E'a342d1e1-d37d-4755-80a4-aa16784face2', E'LIST');

INSERT INTO public.parameter_types ("id", "name")
VALUES (E'c6b5027b-daa5-49de-b76c-d708b95fbaa3', E'FLOAT');

INSERT INTO public.parameter_types ("id", "name")
VALUES (E'b255c7e1-a379-4fb9-a82e-c2064e1dc037', E'COMPLEX');

INSERT INTO public.parameter_types ("id", "name")
VALUES (E'692c38e1-577c-4d1f-899d-b54000993aba', E'INTEGER');

INSERT INTO public.parameter_types ("id", "name")
VALUES (E'09e16b54-a1e8-434c-b39a-63aea1a48df7', E'STRING');

INSERT INTO public.parameter_types ("id", "name")
VALUES (E'c865226f-1ec2-4ed9-8b48-6de247baae25', E'BOOLEAN');

-- Metric types

INSERT INTO public.metric_types ("id", "name")
VALUES (E'1085e7c6-add6-475e-8bf1-01253c0e6e4e', E'UNDEFINED');

INSERT INTO public.metric_types ("id", "name")
VALUES (E'8ae2fb05-4cd0-4091-ae40-42d9f94e93d2', E'F1_SCORE');

INSERT INTO public.metric_types ("id", "name")
VALUES (E'3b8b7bd0-69ee-444e-a260-87d3b713c72c', E'PRECISION');

INSERT INTO public.metric_types ("id", "name")
VALUES (E'ab3d9bbe-fa60-4ecd-be18-fc786b073fa0', E'RECALL');

-- Pipeline types

INSERT INTO public.pipeline_types ("id", "name")
VALUES (E'8a4dd878-3538-434b-aef1-f1c4aeaae9a1', E'DATA');

INSERT INTO public.pipeline_types ("id", "name")
VALUES (E'c1ec5c70-ef27-4e5c-bc0d-3a6d0b76219c', E'EXPERIMENT');

INSERT INTO public.pipeline_types ("id", "name")
VALUES (E'2c4b7990-4a97-4ccb-b962-4f2ebe5193c1', E'VISUALIZATION');

-- File purposes types

INSERT INTO public.file_purposes ("id", "purpose_name", "max_file_size", "file_ext_allowed")
VALUES (E'4814d73e-0043-4aac-8443-fb0cff859491', E'Project main picture', 0, E'*.*');

INSERT INTO public.file_purposes ("id", "purpose_name", "max_file_size", "file_ext_allowed")
VALUES (E'd7fa34ee-9cc8-474e-87e0-095050ea7457', E'User main picture', 0, E'*.*');

INSERT INTO public.file_purposes ("id", "purpose_name", "max_file_size", "file_ext_allowed")
VALUES (E'145be80f-4352-4a89-a7a3-cd20ebc03352', E'Undefined', 0, E'*.*');

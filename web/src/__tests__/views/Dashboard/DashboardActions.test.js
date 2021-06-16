import { buildProjectsRequestBodyV2 } from 'components/layout/Dashboard/dashBoardActions';

test('assert that the search projects request body is generated correctly', () => {
  expect(buildProjectsRequestBodyV2(
    'my-repositories', [], '', 0, true,
  )).toStrictEqual(
    { 
      participate: true,
      own: true, 
      input_data_types_or: [], 
      published: true 
    },
  );

  expect(buildProjectsRequestBodyV2(
    'all', [], '', 0, true,
  )).toStrictEqual(
    { visibility: 'PUBLIC', input_data_types_or: [], published: true },
  );

  expect(buildProjectsRequestBodyV2(
    'all', [], 'jaja project', 0, true,
  )).toStrictEqual(
    { visibility: 'PUBLIC', input_data_types_or: [], name: 'jaja project', published: true },
  );
});

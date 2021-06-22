import { buildProjectsRequestBodyV2 } from 'components/layout/Dashboard/dashBoardActions';
import { dataTypes } from 'components/layout/Dashboard/constants';

describe('test  functions', () => {
  test('assert that the buildProjectsRequestBodyV2 func generate body requests correctly', () => {
    const dts = dataTypes.map((dt) => dt.label);
    const requestBody = buildProjectsRequestBodyV2('my-repositories', [dts[0], dts[1]], '', 5, true);

    expect(requestBody).toStrictEqual({
      participate: true,
      own: true,
      input_data_types_or: ['TEXT', 'IMAGE'],
      min_stars: 5,
      published: true,
    });

    const requestBody1 = buildProjectsRequestBodyV2('all', [dts[0], dts[1], dts[3]], '', 5, false);

    expect(requestBody1).toStrictEqual({
      visibility: 'PUBLIC',
      input_data_types_or: ['TEXT', 'IMAGE', 'VIDEO'],
      min_stars: 5,
      published: false,
    });

    const requestBody2 = buildProjectsRequestBodyV2('starred', [dts[0]], '', 0, false);

    expect(requestBody2).toStrictEqual({
      input_data_types_or: ['TEXT'],
      min_stars: 1,
      published: false,
    });
  });
});

test('assert that body generation works changing the name', () => {
  expect(buildProjectsRequestBodyV2(
    'all', [], 'jaja project', 0, true,
  )).toStrictEqual(
    { visibility: 'PUBLIC', input_data_types_or: [], name: 'jaja project', published: true },
  );
});

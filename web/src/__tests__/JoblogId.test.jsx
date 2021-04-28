import React from 'react';
import { mount } from 'enzyme';
import JobLogById from 'components/views/ExperimentInsights/InsightMenu/JoblogsById';
import { generatePromiseResponse, sleep } from 'functions/testUtils';
import { jobMock } from 'testData';

const setup = () => mount(
  <JobLogById
    logId={1}
    projectId={1}
  />,
);

const modifiedMockJob = { ...jobMock, status: 'running' };

describe('render', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch')
      .mockImplementation(() => generatePromiseResponse(200, true, modifiedMockJob, 50));
    setup();
  });
  test('render', async () => {
    await sleep(100);
    const apiReq = global.fetch.mock.calls[0][0];
    expect(apiReq.url).toBe('/api/v4/projects/1/jobs/1');
  });
});

import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import Jobs from 'components/views/ExperimentInsights/InsightMenu/jobs';
import { generatePromiseResponse, sleep, storeFactory } from '../functions/testUtils';
import { projectsArrayMock, jobMock, mockedDataInstanceDetails } from '../testData';

const setup = () => {
  const store = storeFactory({
    projects: projectsArrayMock.projects,
  });
  return mount(
    <MemoryRouter>
      <Jobs store={store} />
    </MemoryRouter>,
  );
};

describe('job table contains jobs', () => {
  let wrapper;
  beforeEach(() => {
    const dInst = { ...mockedDataInstanceDetails, name: 'experiment/08e94760' };
    jest.spyOn(global, 'fetch').mockImplementation((req) => req.url.includes('/api/v1/data-projects')
      ? generatePromiseResponse(200, true, [dInst], 50)
      : generatePromiseResponse(200, true, [jobMock], 50));
    wrapper = setup();
  });

  test('assert that rendering and filtering of jobs work', async () => {
    await sleep(1000);
    wrapper.setProps({});

    expect(wrapper.find('td.job-pipeline-number').text().includes('#104595479')).toBeTruthy();
    expect(wrapper.find('td.duration').text().includes('00:08:58')).toBeTruthy();

    wrapper.find('button#running').simulate('click');
    expect(wrapper.find('tbody').children()).toHaveLength(0);
  });

  afterEach(() => {
    global.fetch.mockClear();
  });
});

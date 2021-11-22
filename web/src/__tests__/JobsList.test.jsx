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
      <Jobs store={store} namespace="some-namespace" slug="some-slug" />
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

  test('assert that tabler contains the most relevant information', async () => {
    await sleep(1000);
    wrapper.setProps({});

    expect(wrapper.find('td.job-pipeline-number').text().includes('#104595479')).toBeTruthy();
    expect(wrapper.find('td.duration').text().includes('00:08:58')).toBeTruthy();

    const links = wrapper.find('tbody.job-table-body').find('Link');
    expect(links).toHaveLength(3);
    links.forEach((link) => {
      expect(link.props().to).toBe('/some-namespace/some-slug/insights/-/jobs/386629443');
    });
  });

  test('assert that query is modified to filter by running', () => {
    wrapper.find('button#running').simulate('click');
    expect(global.fetch.mock.calls[3][0].url).toContain('/api/v4/projects/12395599/jobs?scope[]=running');
  });

  test('assert that query is modified to filter by success', () => {
    wrapper.find('button#success').simulate('click');
    expect(global.fetch.mock.calls[3][0].url).toContain('/api/v4/projects/12395599/jobs?scope[]=success');
  });

  test('assert that query is modified to filter by failed', () => {
    wrapper.find('button#failed').simulate('click');
    expect(global.fetch.mock.calls[3][0].url).toContain('/api/v4/projects/12395599/jobs?scope[]=failed');
  });

  test('assert that query is modified to filter by canceled', () => {
    wrapper.find('button#canceled').simulate('click');
    expect(global.fetch.mock.calls[3][0].url).toContain('/api/v4/projects/12395599/jobs?scope[]=canceled');
  });

  afterEach(() => {
    global.fetch.mockClear();
  });
});

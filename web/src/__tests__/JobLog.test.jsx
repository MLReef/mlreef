import React from 'react';
import { mount } from 'enzyme';
import JobLog from 'components/commons/JobLog';
import { jobMock } from 'testData';
import b64toBlob from 'b64-to-blob';
import { sleep, storeFactory } from 'functions/testUtils';
import { MemoryRouter as Router } from 'react-router-dom';
import dayjs from 'dayjs';
import durationModule from 'dayjs/plugin/duration';
import relativeModule from 'dayjs/plugin/relativeTime';

dayjs.extend(durationModule);
dayjs.extend(relativeModule);

const jobLogResponse = {
  ok: true,
  blob: async () => {
    const contentType = 'img/png';
    const b64Data = 'YWphamFqYWphamFqYWphamFqYWpqYQ==';

    return b64toBlob(b64Data, contentType);
  },
};

const store = storeFactory({
  projects: {
    selectedProject: {
      id: '5d005488-afb6-4a0c-852a-f471153a04b5',
    },
  },
});

const setup = () => {
  jest.spyOn(global, 'fetch').mockImplementation(() => new Promise((resolve) => resolve(jobLogResponse)));
  const wrapper = mount(
    <Router>
      <JobLog projectId={14448940} store={store} job={jobMock} currentState="" />
    </Router>,
  );

  return wrapper;
};

describe('assert that component includes information about job', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('main info', async () => {
    await sleep(200);
    wrapper.setProps({});
    const { created_at: createdAt } = jobMock;

    const jobTimeCreatedAgo = dayjs(createdAt).fromNow();
    const titleText = wrapper.find('[data-testid="created"]').text();

    expect(titleText.includes(jobMock.id)).toBe(true);
    expect(titleText.includes(jobTimeCreatedAgo)).toBe(true);

    const logLine = wrapper.find('div.log-line');
    expect(logLine).toHaveLength(1);

    expect(logLine.children().at(1).text()).toBe('ajajajajajajajajajajja');
  });

  test('additional info', async () => {
    await sleep(200);
    wrapper.setProps({});
    const { duration, runner } = jobMock;

    expect(wrapper.find('[data-testid="duration"]').text()
      .includes(dayjs.duration(duration, 'seconds').format('H[h] m[m] s[s]')));
    expect(wrapper.find('[data-testid="pipeline"]').text().includes(jobMock.pipeline.id));
    expect(wrapper.find('[data-testid="runner"]').text().includes(runner.description));
    expect(wrapper.find('[data-testid="runner"]').text().includes(runner.id));
  });

  afterEach(() => {
    global.fetch.mockClear();
  });
});

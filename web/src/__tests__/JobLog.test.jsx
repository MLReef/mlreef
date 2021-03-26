import React from 'react';
import { mount } from 'enzyme';
import JobLog from 'components/commons/JobLog';
import { jobLogMock, jobMock } from 'testData';
import { storeFactory } from 'functions/testUtils';
// import { getTimeCreatedAgo, parseDurationInSeconds } from 'functions/dataParserHelpers';
import jobActions from 'components/ExperimentDetails/actions';
import { MemoryRouter as Router } from 'react-router-dom';
import dayjs from 'dayjs';
import durationModule from 'dayjs/plugin/duration';
import relativeModule from 'dayjs/plugin/relativeTime';

dayjs.extend(durationModule);
dayjs.extend(relativeModule);

const jobLogResponse = {
  ok: true,
  blob: async () => jobLogMock,
};

const store = storeFactory({
  projects: {
    selectedProject: {
      id: '5d005488-afb6-4a0c-852a-f471153a04b5',
    },
  },
});

const setup = () => {
  jobActions.getJobLog = jest.fn(() => new Promise((resolve) => resolve(jobLogResponse)));
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

  test('main info', () => {
    const { created_at: createdAt } = jobMock;

    const jobTimeCreatedAgo = dayjs(createdAt).fromNow();
    const titleText = wrapper.find('[data-testid="created"]').text();

    expect(titleText.includes(jobMock.id)).toBe(true);
    expect(titleText.includes(jobTimeCreatedAgo)).toBe(true);
  });

  test('additional info', () => {
    const { duration, runner } = jobMock;

    expect(wrapper.find('[data-testid="duration"]').text()
      .includes(dayjs.duration(duration, 'seconds').format('H[h] m[m] s[s]')));
    expect(wrapper.find('[data-testid="pipeline"]').text().includes(jobMock.pipeline.id));
    expect(wrapper.find('[data-testid="runner"]').text().includes(runner.description));
    expect(wrapper.find('[data-testid="runner"]').text().includes(runner.id));
  });
});

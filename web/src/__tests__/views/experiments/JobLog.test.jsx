import React from 'react';
import { mount } from 'enzyme';
import JobLog from 'components/ExperimentDetails/MenuOptions/jobLog';
import { jobLogMock, jobMock } from 'testData';
import { storeFactory } from 'functions/testUtils';
import { getTimeCreatedAgo, parseDurationInSeconds } from 'functions/dataParserHelpers';
import jobActions from 'components/ExperimentDetails/actions';
import { MemoryRouter as Router } from 'react-router-dom';

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
    wrapper.setProps({});
    console.log(wrapper.debug());

    const { created_at } = jobMock;
    const jobTimeCreatedAgo = getTimeCreatedAgo(created_at, new Date());
    const titleText = wrapper.find('#number-and-time-ago-cont').text();
    expect(titleText.includes(jobMock.id)).toBe(true);
    expect(titleText.includes(jobTimeCreatedAgo)).toBe(true);
  });

  test('additional info', () => {
    const { duration, runner } = jobMock;
    const additionalInfo = wrapper.find('#additional-info-job');
    const parsedDuration = parseDurationInSeconds(duration);
    const children = additionalInfo.children();
    const jobInfoLine = children.first().children();
    const runnerInfo = children.at(1).children().first();

    expect(jobInfoLine.at(0).text().includes(parsedDuration));
    expect(jobInfoLine.at(1).text().includes(jobMock.pipeline.id));
    expect(runnerInfo.text().includes(runner.description));
    expect(runnerInfo.text().includes(runner.id));
  });
});

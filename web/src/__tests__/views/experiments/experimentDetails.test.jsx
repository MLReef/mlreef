import React from 'react';
import { shallow } from 'enzyme';
import 'babel-polyfill';
import JobLog from 'components/experiment-details/menu-options/jobLog';
import { jobMock } from 'testData';
import { storeFactory } from 'functions/testUtils';
import { getTimeCreatedAgo, parseDurationInSeconds } from 'functions/dataParserHelpers';

const store = storeFactory({
  projects: {
    selectedProject: {
      id: '5d005488-afb6-4a0c-852a-f471153a04b5',
    },
  },
});

const setup = () => {
  const wrapper = shallow(
    <JobLog projectId={14448940} store={store} job={jobMock} currentState="" />,
  );

  return wrapper;
};

describe('assert that component includes information about job', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup().dive().dive();
  });

  test('main info', () => {
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

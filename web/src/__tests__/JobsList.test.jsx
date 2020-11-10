import React from 'react';
import { shallow } from 'enzyme';
import { projectsArrayMock } from '../testData';
import { storeFactory } from '../functions/testUtils';
import Jobs from '../components/insights/insights-menu/jobs';
import { jobMock } from '../testData';

const setup = () => {
  const store = storeFactory({
    projects: projectsArrayMock.projects,
  });
  const wrapper = shallow(
    <Jobs
      id={projectsArrayMock.projects.selectedProject.id}
      jobs={jobMock}
      store={store}
    />,
  );
  const afterDive = wrapper.dive().dive();
  return afterDive;
};

describe('job table contains jobs', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that job table or empty table is shown', () => {
    expect(wrapper.find('tbody').children()).toHaveLength(0);
  });

  test('assert that empty logo is displayed', () => {
    expect(wrapper.find('.job-table-empty > img')).toHaveLength(1);
  });
});

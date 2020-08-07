import React from 'react';
import { shallow } from 'enzyme';
import { projectsArrayMock } from '../testData';
import { storeFactory } from '../functions/testUtils';
import Insights from '../components/insights/insights';

const match = {
  path: '/my-projects/:projectId/insights/-/jobs',
  url: '/my-projects/5/insights/-/jobs',
  isExact: true,
  params: {
    projectId: '5',
  },
};

const setup = () => {
  const store = storeFactory({
    projects: projectsArrayMock.projects,
  });
  const wrapper = shallow(
    <Insights
      store={store}
      match={match}
    />,
  );
  const afterDive = wrapper.dive().dive();
  return afterDive;
};

describe('frontend contains initial insights tab elements', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that insight-menu buttons are present', () => {
    expect(wrapper.find('#insights-menu').children()).toHaveLength(1);
  });

  test('assert that jobs table is shown', () => {
    expect(wrapper.find('.job-table'));
  });
});

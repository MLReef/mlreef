import React from 'react';
import { shallow } from 'enzyme';
import 'babel-polyfill';

import { storeFactory } from '../functions/testUtils';
import { projectsArrayMock, mockMergeRequests } from '../testData';
import MergeRequestOverview from '../components/new-merge-request/merge-request-overview';

const setup = () => {
  const store = storeFactory({
    projects: projectsArrayMock.projects,
  });
  const wrapper = shallow(
    <MergeRequestOverview store={store} />,
  );
  const afterDive = wrapper.dive().dive();
  return afterDive;
};

describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that create branch button is rendered when values pass validation', () => {
    wrapper.instance().setState({ btnSelected: 'closed-btn', mrsList: mockMergeRequests });
    expect(wrapper.find('#merge-requests-container-div').at(0).children()).toHaveLength(1);
  });
});

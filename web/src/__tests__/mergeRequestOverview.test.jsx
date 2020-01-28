import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'babel-polyfill';

import { storeFactory } from '../functions/testUtils';
import { projectsArrayMock, mockMergeRequests } from '../testData';
import MergeRequestOverview from '../components/new-merge-request/merge-request-overview';

Enzyme.configure({ adapter: new Adapter() });

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
    wrapper.instance().setState({ mrsList: mockMergeRequests });
  });
  test('assert that create branch button is rendered when values are right', () => {
    wrapper.instance().setState({ btnSelected: 'closed-btn' });
    expect(wrapper.find('#merge-requests-container-div').at(0).children()).toHaveLength(1);
  });
});

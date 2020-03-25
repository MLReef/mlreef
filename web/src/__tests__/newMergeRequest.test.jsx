/* eslint-disable no-undef */
import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import NewMergeRequest from '../components/new-merge-request/newMergeRequest';
import { projectsArrayMock, imagesToRender } from '../testData';
import { storeFactory } from '../functions/testUtils';

Enzyme.configure({ adapter: new Adapter() });

const match = {
  path: '/my-projects/:projectId/:branch/new-merge-request',
  url: '/my-projects/14448940/master/new-merge-request',
  isExact: true,
  params: {
    projectId: '14448940',
    branch: 'master',
  },
};

const setup = () => {
  const store = storeFactory({
    branches: ['mock-branch-1', 'mock-branch-2', 'mock-branch-3'],
    projects: projectsArrayMock.projects,
  });
  const wrapper = shallow(
    <NewMergeRequest
      store={store}
      match={match}
      branchSelected="master"
      history={{ goBack: () => {} }}
    />,
  );
  const afterDive = wrapper.dive().dive();
  afterDive.instance().setState({ imagesToRender });
  return afterDive;
};

describe('frontend should contain initial html elements', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that there exists a paragraph that contains branch selected name', () => {
    expect(wrapper.find('#branch-selected-name').text().includes('master')).toBe(true);
  });
  test('assert that there exists a select to pick the target branch', () => {
    expect(wrapper.find('CustomizedSelect').length).toBe(1);
  });
  test('assert that there exists an input to enter merge request name', () => {
    expect(wrapper.find('#title-mr-input').length).toBe(1);
  });
  test('assert that there exists a text area to enter description', () => {

  });
  test('assert that there exists a cancel button', () => {
    expect(wrapper.find('#cancel-button').length).toBe(1);
  });
  test('assert that there exists a button to submit merge request', () => {
    expect(wrapper.find('#submit-merge-request').length).toBe(1);
  });
});

describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that commits list is rendered when diffs array are set in state', () => {
    wrapper.instance().onBranchChanged('something');
  });
  test('assert that image changes are rendered when dropdown button is pressed', () => {

  });
});

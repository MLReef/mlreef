import React from 'react';
import { shallow } from 'enzyme';
import NewMergeRequestView from 'components/new-merge-request/newMergeRequest';
import { projectsArrayMock, imagesToRender } from '../testData';
import { storeFactory } from '../functions/testUtils';

// TODO: No idea why this component has only empty test. Probably my fault(Andres)

const match = {
  path: '/:namespace/:slug/-/merge_requests/new',
  url: '/my-namespace/project-slug/-/merge_requests/new',
  isExact: true,
  params: {
    namespace: 'mlreef',
    slug: 'test-project',
  },
};

const location = {
  search: '',
};

const setup = () => {
  const store = storeFactory({
    branches: ['mock-branch-1', 'mock-branch-2', 'mock-branch-3'],
    projects: projectsArrayMock.projects,
  });
  const wrapper = shallow(
    <NewMergeRequestView
      store={store}
      match={match}
      location={location}
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
  test('assert that branch name is displayed', () => {
    expect(wrapper.find('#branch-selected-name').text().includes('master')).toBe(true);
  });
  test('assert that target branch dropdown exists', () => {

  });
  test('assert that MergeRequestEdit is present', () => {
    expect(wrapper.find('MergeRequestEdit').length).toBe(1);
  });
  test('assert that description text area exists', () => {

  });
  test('assert that cancel merge request button exists', () => {
    expect(wrapper.find('#cancel-button').length).toBe(1);
  });
  test('assert that submit merge request button exists', () => {
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

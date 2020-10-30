import React from 'react';
import { shallow } from 'enzyme';
import NewMergeRequestView from 'components/views/MergeRequests/NewMergeReq';
import actions from 'components/views/MergeRequests/mergeReqActions';
import { projectsArrayMock, imagesToRender, branchesMock } from '../testData';
import { storeFactory } from '../functions/testUtils';

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
  search: '?merge_request[source_branch]=yes-2',
};

let goBack;

const setup = () => {
  actions.submit = jest.fn(() => new Promise((resolve) => resolve('resolve')));
  goBack = jest.fn();
  const store = storeFactory({
    branches: branchesMock,
    projects: projectsArrayMock.projects,
  });
  const wrapper = shallow(
    <NewMergeRequestView
      store={store}
      match={match}
      location={location}
      branchSelected="master"
      history={{ goBack }}
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
    expect(wrapper.find('#branch-selected-name').text().includes('yes-2')).toBe(true);
    expect(wrapper.find('MergeRequestEdit').length).toBe(1);
    expect(wrapper.find('#cancel-button').length).toBe(1);
    expect(wrapper.find('#submit-merge-request').length).toBe(1);
    expect(wrapper.find('MSelect').length).toBe(1);
    expect(wrapper.find('ImageDiffSection').length).toBe(1);
  });
  test('assert that the proper form is submitted', () => {
    const branchSelectedIndex = 0;
    wrapper
      .find('MSelect')
      .dive()
      .find('li')
      .at(branchSelectedIndex)
      .simulate('click');
    expect(wrapper.find('MSelect').props().value).toBe(branchesMock[branchSelectedIndex].name);

    const mergeRequestEdit = wrapper.find('MergeRequestEdit').dive().dive();
    const title = 'Some title';
    const desc = 'Some description';
    mergeRequestEdit.find('input#merge-request-edit-title').simulate('change', { target: { value: title } });
    mergeRequestEdit.find('textarea#merge-request-edit-description').simulate('change', { target: { value: desc } });

    const { projects: { selectedProject: { gid } } } = projectsArrayMock;
    wrapper.find('button#submit-merge-request').simulate('click');
    expect(actions.submit).toHaveBeenCalledWith(gid, 'yes-2', branchesMock[branchSelectedIndex].name, title, desc);
  });

  test('assert that cancel button event is handled correctly', () => {
    wrapper.find('button#cancel-button').simulate('click');
    expect(goBack).toHaveBeenCalled();
  });
});

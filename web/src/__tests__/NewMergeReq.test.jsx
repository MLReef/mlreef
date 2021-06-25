import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import NewMergeRequestView from 'components/views/MergeRequests/NewMergeReq';
import actions from 'components/views/MergeRequests/mergeReqActions';
import commitDetailActions from 'components/views/CommitsDetails/actionsAndFunctions';
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
  commitDetailActions.getDiffDetails = jest
    .fn(() => new Promise((resolve) => resolve(imagesToRender)));
  goBack = jest.fn();
  const store = storeFactory({
    branches: branchesMock,
    projects: projectsArrayMock.projects,
  });
  const wrapper = mount(
    <MemoryRouter>
      <Provider store={store}>
        <NewMergeRequestView
          store={store}
          match={match}
          location={location}
          branchSelected="master"
          history={{ goBack }}
        />
      </Provider>
    </MemoryRouter>,
  );

  return wrapper;
};

describe('frontend should contain initial html elements', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that branch name is displayed', () => {
    wrapper.setProps({});
    expect(wrapper.find('#branch-selected-name').text().includes('yes-2')).toBe(true);
    expect(wrapper.find('MergeRequestEdit').length).toBe(1);
    expect(wrapper.find('#cancel-button').length).toBe(1);
    expect(wrapper.find('#submit-merge-request').length).toBe(1);
    expect(wrapper.find('MBranchSelector').length).toBe(1);
    expect(wrapper.find('ImageDiffSection').length).toBe(1);
  });
  test('assert that the proper form is submitted', () => {
    const branchSelectedIndex = 0;
    wrapper
      .find('MBranchSelector')
      .find('li')
      .at(branchSelectedIndex)
      .simulate('click');
    expect(wrapper.find('MBranchSelector').props().activeBranch).toBe(branchesMock[branchSelectedIndex].name);

    const mergeRequestEdit = wrapper.find('MergeRequestEdit');
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

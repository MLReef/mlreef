import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import FilesContainer from 'components/FilesContainer';
import filesContainerActions from 'components/FilesContainer/filesContainerActions';
import { generatePromiseResponse, sleep, storeFactory } from 'functions/testUtils';
import { filesMock } from 'testData';

const setup = (urlBranch = 'master') => mount(
  <Provider store={storeFactory({})}>
    <MemoryRouter>
      <FilesContainer
        projectId={1}
        path=""
        urlBranch={urlBranch}
        defaultBranch="master"
        namespace="mlreef"
        slug="sign-language-classifier"
      />
    </MemoryRouter>
  </Provider>,
);

describe('test basic ui rendering', () => {
  let wrapper;

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(() => generatePromiseResponse(200, true, filesMock, 100));
    wrapper = setup();
  });

  test('assert that all files render with the correct icon', async () => {
    await sleep(200);
    wrapper.setProps({});
    const fileRows = wrapper.find('tr.files-row');
    expect(fileRows.length).toBeGreaterThan(0);
    fileRows.forEach((node, ind) => {
      expect(node.props().id.includes(filesMock[ind].id)).toBe(true);

      const { src } = node.childAt(0).childAt(0).childAt(0).props();
      if (filesMock[ind].type === 'tree') {
        expect(src.includes('folder_01.svg')).toBe(true);
      } else {
        expect(src.includes('file_01.svg')).toBe(true);
      }
    });
  });

  test('assert that clicking on directory reroutes to that folder', async () => {
    await sleep(200);
    wrapper.setProps({});
    const fileRows = wrapper.find('tr.files-row');
    expect(wrapper.find('Router').props().history.length).toBe(1);
    fileRows.at(0).simulate('click');
    expect(wrapper.find('Router').props().history.length).toBe(2);
    expect(wrapper.find('Router').props().history.location.pathname).toBe('/mlreef/sign-language-classifier/-/tree/master/directory_1');
  });

  afterEach(() => {
    global.fetch.mockClear();
  });
});

describe('test edge cases', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(() => generatePromiseResponse(200, true, filesMock, 100));
    filesContainerActions.compareBranchesFunction = jest.fn(() => new Promise((resolve) => resolve({
      ahead: [{}, {}], behind: [],
    })));
  });

  test('assert that url other than default branch is covered correctly', async () => {
    const wrapper = setup('new-branch');
    await sleep(250);
    wrapper.setProps({});

    expect(filesContainerActions.compareBranchesFunction).toHaveBeenCalled();
    expect(wrapper.find('p#commitStatus').text()).toBe('This branch is 2 commit(s) ahead and 0 commit(s) behind "master".');
    const createMRlink = wrapper.find('AuthWrapper').find('a');
    expect(createMRlink.text()).toBe('Create merge request');
    expect(createMRlink.props().href).toBe('/mlreef/sign-language-classifier/-/merge_requests/new?merge_request[source_branch]=new-branch');
  });
});

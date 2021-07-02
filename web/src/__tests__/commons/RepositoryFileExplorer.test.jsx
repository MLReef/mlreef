import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import RepositoryFileExplorer from 'components/commons/RepositoryFileExplorer';
import { generatePromiseResponse, sleep, storeFactory } from 'functions/testUtils';
import { branchesMock, filesMock, projectsArrayMock } from 'testData';

const setup = () => {
  const store = storeFactory({
    branches: branchesMock,
    projects: projectsArrayMock.projects,
  });
  return mount(
    <Provider store={store}>
      <RepositoryFileExplorer />
    </Provider>
  );
}

describe('test UI and functionality', () => {
  let wrapper;
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation(() => generatePromiseResponse(
      200, 
      true,
      filesMock,
      10
    ));
    wrapper = setup();
  });
  test('assert that basic elements render', async () => {
    await sleep(20);
    wrapper.setProps({});
    
    const branchesUl = wrapper.find('div.branches > ul');
    expect(branchesUl).toHaveLength(1);

    const branchesListUI = branchesUl.find('li');
    const filteredBranches = branchesMock.filter((branch) => !branch.name.startsWith('data-pipeline')
      && !branch.name.startsWith('experiment') 
      && !branch.name.startsWith('data-visualization')
    )
    expect(branchesListUI).toHaveLength(filteredBranches.length);
    branchesListUI.forEach((liNode, ind) => {
      expect(liNode.text()).toBe(filteredBranches[ind].name);
    });

    const liFiles = wrapper.find('ul.m-file-explorer-files-list').children();
    expect(liFiles.length).toBe(filesMock.length);
    liFiles.forEach((fileUI, ind) => {
      expect(
        fileUI.find('div.m-file-explorer-files-list-item-btn-file-label').text()
      ).toBe(filesMock[ind].name);
    });
  });
});

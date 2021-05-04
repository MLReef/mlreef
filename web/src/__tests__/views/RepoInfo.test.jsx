import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import RepoInfo from 'components/repoInfo';
import { storeFactory } from 'functions/testUtils';
import { projectsArrayMock, mockMergeRequests } from 'testData';
import classifiedMockedDatainstances from './DataInstances/testData';
import classifiedMockedVisualizations from './DataVisualizations/testData';

const setup = (searchableType) => {
  const store = storeFactory({ 
    datainstances: classifiedMockedDatainstances, 
    visualizations: classifiedMockedVisualizations,
  });

  return mount(
    <Provider store={store}>
      <MemoryRouter>
        <RepoInfo
          project={{ ...projectsArrayMock.projects.selectedProject, searchableType }}
          mergeRequests={mockMergeRequests}
          currentBranch="master"
          branchesCount={3}
          publicationsCount={2}
        />
      </MemoryRouter>
    </Provider>,
  );
};

describe('basic rendering', () => {
  let wrapper;

  test('assert that data project renders correctly', () => {
    wrapper = setup(PROJECT_TYPES.DATA_PROJ);

    const visCount = wrapper.find('.visualizations-count');
    expect(visCount).toHaveLength(1);
    expect(visCount.text()).toBe('2 Visualizations');

    const datasetsCount = wrapper.find('.datasets-count');
    expect(datasetsCount).toHaveLength(1);

    expect(datasetsCount.text()).toBe('2 Datasets');
  });

  test('assert that code project renders correctly', () => {
    wrapper = setup(PROJECT_TYPES.CODE_PROJ);

    const publicationsCount = wrapper.find('p.publications-count');
    expect(publicationsCount).toHaveLength(1);
  });
});

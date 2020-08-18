import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { mount } from 'enzyme';
import { storeFactory } from 'functions/testUtils';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import ExploreView from 'components/views/ExploreView';

const setup = () => {
  const store = storeFactory({
    projects: {
      selectedProject: {
        backendId: 'anything',
        ownerId: 'anything-else',
      },
      all: [],
      codeProjects: {
        [PROJECT_TYPES.ALGORITHM]: {
          all: [],
        },
        [PROJECT_TYPES.OPERATION]: {
          all: [],
        },
        [PROJECT_TYPES.VISUALIZATION]: {
          all: [],
        },
      },
    },
  });

  const wrapper = mount(
    <Provider store={store}>
      <Router>
        <ExploreView />
      </Router>
    </Provider>,
  );

  return wrapper.find(ExploreView);
};

describe('ExploreView basics', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  test('assert render', () => {
    expect(wrapper.find('.explore-view-content')).toHaveLength(1);
  });

  test('assert that ExploreView contains basic components', () => {
    const mainTabs = wrapper.find('MSimpleTabs');

    expect(wrapper.find('Navbar')).toHaveLength(1);
    expect(mainTabs).toHaveLength(1);
    // one MTabs for each type of project
    expect(mainTabs.find('MTabs')).toHaveLength(4);
    // Each MTabs have a corresponding MDataFilters
    expect(mainTabs.find('MDataFilters')).toHaveLength(4);
    // There are 2 ExploreViewProjectSet per MTabs
    expect(mainTabs.find('ExploreViewProjectSet')).toHaveLength(8);
  });
});

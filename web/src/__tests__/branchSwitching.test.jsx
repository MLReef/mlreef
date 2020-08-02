import React from 'react';
import { Provider } from 'react-redux';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import MDropdown from 'components/ui/MDropdown';
import { MemoryRouter } from 'react-router-dom';
import { RepoFeatures } from '../components/repoFeatures';
import { projectsArrayMock, branchesMock } from '../testData';
import { storeFactory } from '../functions/testUtils';

const setup = () => shallow(
  <RepoFeatures
    projects={projectsArrayMock.projects}
    branch="master"
    branches={branchesMock}
    path=""
    projectId={projectsArrayMock.projects.selectedProject.gid}
    searchableType={projectsArrayMock.projects.selectedProject.searchableType}
    updateLastCommit={() => {}}
  />,
);

describe('There should render', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  it('renders without crashing given the required props', () => {
    const buttonsContainer = wrapper.find('#repo-features');
    expect(buttonsContainer).toHaveLength(1);
  });
});

describe('Dropdown appears on button click', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  it('renders without crashing given the required props', () => {
    wrapper
      .find(MDropdown)
      .first()
      .dive()
      .find('.m-dropdown-button button')
      .simulate('click');

    expect(
      wrapper
        .find(MDropdown)
        .first()
        .dive()
        .find('.m-dropdown-list-container'),
    ).toHaveLength(1);
  });
});

describe('The branches list should be displayed when dropdown button is clicked', () => {
  it('dropdown of branches appear', () => {
    const store = storeFactory({
      projects: projectsArrayMock.projects,
      branches: branchesMock,
      user: {
        membership: 1,
        username: 'mlreef',
      },
    });

    const component = renderer
      .create(
        <Provider store={store}>
          <MemoryRouter key="rerere">
            <RepoFeatures
              store={store}
              projects={projectsArrayMock.projects}
              branch="master"
              branches={branchesMock}
              path=""
              projectId={projectsArrayMock.projects.selectedProject.gid}
              searchableType={projectsArrayMock.projects.selectedProject.searchableType}
              updateLastCommit={() => {}}
            />
          </MemoryRouter>
        </Provider>,
      )
      .toJSON();

    expect(component).toMatchSnapshot();
  });
});

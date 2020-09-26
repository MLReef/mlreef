import React from 'react';
import GroupProjects from 'components/views/MlreefGroups/GroupProjects';
import { storeFactory } from 'functions/testUtils';
import { MemoryRouter } from 'react-router-dom';
import { projectsArrayMock } from 'testData';
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

const store = storeFactory({
  projects: {
    all: projectsArrayMock.projects.backendProject,
  },
});

const setup = () => shallow(
  <GroupProjects
    groupPath="test-group"
    groupName="Test-group"
    projects={projectsArrayMock.projects.groupProject}
    store={store}
  />,
).dive().dive();

global.ResizeObserver = () => ({ observe: jest.fn() });

describe('test basic rendering', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that elements exist in the component', () => {
    expect(wrapper.find('button#personal-btn')).toHaveLength(1);
    expect(wrapper.find('.project-dropdown-btn')).toHaveLength(1);
    expect(wrapper.find('.group-projects > .flex-row').children()).toHaveLength(1);
    expect(wrapper.find('.noelement-found-div')).toHaveLength(0);
    expect(wrapper.find('MCheckBox')).toHaveLength(6);
  });
});

describe('test UI functionality', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that dropdown functions', () => {
    wrapper.find('.project-dropdown-btn').simulate('click');
    expect(wrapper.find('.dropdown')).toHaveLength(1);
  });
});

describe('snapshot for GroupProjects', () => {
  test('assert that snapshot matches', () => {
    const snapshot = renderer.create(
      <MemoryRouter>
        <GroupProjects
          groupPath="test-group"
          groupName="Test-group"
          projects={projectsArrayMock.projects.groupProject}
          store={store}
        />
      </MemoryRouter>,
    )
      .toJSON();
    expect(snapshot).toMatchSnapshot();
  });
});

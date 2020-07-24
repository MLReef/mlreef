import React from 'react';
import { shallow } from 'enzyme';
import { UnconnectedGroupsOverview } from 'components/views/groupsOverview/GroupOverview';

const mockedGroups = [
  {
    id: 1, name: 'A group', description: 'a mocked group', projects: [],
  },
  {
    id: 2, name: 'A group', description: 'a mocked group', projects: [],
  },
];

const setup = () => shallow(
  <UnconnectedGroupsOverview
    groups={mockedGroups}
    projects={[]}
    actions={{
      getGroupsList: () => {},
      setIsLoading: () => {},
      getProjectsList: () => {},
    }}
  />,
);

describe('test basic rendering', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that elements exist in the comp', () => {
    expect(wrapper.find('button#own')).toHaveLength(1);
    expect(wrapper.find('button#explore')).toHaveLength(1);
    expect(wrapper.find('#new-group-link')).toHaveLength(1);
    expect(wrapper.find('#show-projects-filter')).toHaveLength(1);
    expect(wrapper.find('MCheckBox')).toHaveLength(4);
  });
});

describe('test functionality', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that handlers are called', () => {
    const mockedOwnHandler = jest.fn();
    const mockedExploreHandler = jest.fn();
    const mockedShowProjectsHandler = jest.fn();
    wrapper.instance().ownClickHandler = mockedOwnHandler;
    wrapper.instance().exploreClickHandler = mockedExploreHandler;
    wrapper.instance().showProjectsHandler = mockedShowProjectsHandler;
    wrapper.find('button#own').simulate('click');
    expect(mockedOwnHandler.mock.calls.length).toBe(1);
    wrapper.find('button#explore').simulate('click');
    expect(mockedExploreHandler.mock.calls.length).toBe(1);
    wrapper.find('#show-projects-filter').dive().find('button').simulate('click', {});
    expect(wrapper.state().isHasProjectsVisible).toBe(false);
    expect(wrapper.find('MCheckBox')).toHaveLength(0);
  });
});

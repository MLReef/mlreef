import React from 'react';
import { shallow } from 'enzyme';
import { UnconnectedGroupsOverview } from 'components/views/groupsOverview/GroupOverview';
import { projectsArrayMock } from 'testData';

const getGroupsList = jest.fn();
const setIsLoading = jest.fn();
const getProjectsList = jest.fn();

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
    projects={projectsArrayMock.projects.all}
    actions={{
      getGroupsList,
      setIsLoading,
      getProjectsList,
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

    expect(getProjectsList).toHaveBeenCalledWith(0, 100);
  });
});

describe('test functionality', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that handlers are called', () => {
    wrapper.find('button#own').simulate('click');
    expect(getGroupsList).toHaveBeenCalledWith(true);
    expect(setIsLoading).toHaveBeenCalledWith(true);
    getGroupsList.mockClear();
    /*
    wrapper.find('button#explore').simulate('click');
    expect(getGroupsList).toHaveBeenCalledWith(false);
    expect(setIsLoading).toHaveBeenCalledWith(true);
    */
    // assert that right side filters are hiden after clicking chevron button
    wrapper.find('#show-projects-filter').dive().find('button').simulate('click', {});
    expect(wrapper.state().isHasProjectsVisible).toBe(false);
    expect(wrapper.find('MCheckBox')).toHaveLength(0);
  });
});

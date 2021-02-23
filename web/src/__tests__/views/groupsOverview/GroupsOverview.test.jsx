import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import GroupsOverview from 'components/views/groupsOverview/GroupOverview';
import { projectsArrayMock } from 'testData';
import { MemoryRouter } from 'react-router-dom';
import { storeFactory } from 'functions/testUtils';

const getGroupsList = jest.fn();
const setIsLoading = jest.fn();
const getProjectsList = jest.fn();
const groupProject = projectsArrayMock.projects.all[0];

const mockedGroups = [
  {
    id: 1, name: 'A group', description: 'a mocked group', projects: [{ ...groupProject, id: groupProject.gid }],
  },
  {
    id: 2, name: 'A group', description: 'a mocked group', projects: [],
  },
];

const setup = () => {
  const store = storeFactory({ projects: projectsArrayMock.projects, groups: mockedGroups });
  const wrapper = mount(
    <Provider store={store}>
      <MemoryRouter>
        <GroupsOverview actions={{
          getGroupsList,
          setIsLoading,
          getProjectsList,
        }}
        />
      </MemoryRouter>
    </Provider>,
  );

  return wrapper;
};

describe('test basic rendering', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that elements exist in the comp', () => {
    wrapper.setProps({});
    expect(wrapper.find('button#own')).toHaveLength(1);
    expect(wrapper.find('button#explore')).toHaveLength(1);
    expect(wrapper.find('a#new-group-link')).toHaveLength(1);
    expect(wrapper.find('ArrowButton#show-projects-filter')).toHaveLength(1);
    expect(wrapper.find('MCheckBox')).toHaveLength(4);

    const groupCard = wrapper.find('GroupCard').at(0);
    const groupCardProps = groupCard.props();
    expect(groupCardProps.groupId).toBe(1);
    expect(groupCardProps.groupName).toBe(mockedGroups[0].name);

    expect(groupCard.find('div.projects-section').childAt(0).childAt(0).text()).toBe('1 project(s)');
  });
});

describe('test functionality', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that handlers are called', () => {
    expect(wrapper.props().store.getState().user.isLoading).toBe(false);
    wrapper.find('button#own').simulate('click');
    expect(wrapper.props().store.getState().user.isLoading).toBe(true);

    wrapper.find('button#show-projects-filter').simulate('click', {});
    expect(wrapper.find('MCheckBox')).toHaveLength(0);
  });
});

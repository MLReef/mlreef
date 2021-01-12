import React from 'react';
import { mount } from 'enzyme';
import iconGrey from 'images/icon_grey-01.png';
import GroupCard from 'components/views/groupsOverview/GroupCard';
import groupActions from 'components/views/groupsOverview/GroupActions';
import { membersMock, projectsArrayMock } from 'testData';

const groupCardId = 1;
const groupName = 'Group-name';
const groupDescription = 'A group to contain some testing projects';
const projectsList = projectsArrayMock.projects.all;

const setup = (description) => {
  groupActions.getGroupUsers = jest.fn(() => new Promise((resolve) => resolve(membersMock)));
  return mount(
    <GroupCard
      groupId={groupCardId}
      groupName={groupName}
      groupDescription={description}
      groupProjects={projectsList}
    />,
  );
};

describe('test basic rendering', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup(groupDescription);
  });

  test('assert that elements exist in the comp', () => {
    wrapper.setProps({});
    expect(wrapper.find('.card-title').text()).toBe(groupName);
    expect(wrapper.find('.description').text()).toBe(groupDescription);
    expect(wrapper.find('.projects-section').length).toBe(1);
    expect(wrapper.find('.members-number').childAt(0).text()).toBe(JSON.stringify(membersMock.length));
    expect(wrapper.find('img.member-card-avatar')).toHaveLength(membersMock.length);

    expect(groupActions.getGroupUsers).toHaveBeenCalled();
  });
});

describe('test edge cases in UI', () => {
  test('assert that not found ', () => {
    const wrapper = setup();
    const notFoundDiv = wrapper.find('div.d-flex.noelement-found-div');
    expect(notFoundDiv).toHaveLength(1);
    expect(notFoundDiv.childAt(0).props().src).toBe(iconGrey);
    expect(notFoundDiv.childAt(1).text()).toBe('No description');
  });
});

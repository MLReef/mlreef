import React from 'react';
import { shallow } from 'enzyme';
import GroupCard from 'components/views/groupsOverview/GroupCard';
import { projectsArrayMock } from 'testData';

const groupCardId = 1;
const groupName = 'Group-name';
const groupDescription = 'A group to contain some testing projects';
const projectsList = projectsArrayMock.projects.all;

const setup = () => shallow(
  <GroupCard
    groupId={groupCardId}
    groupName={groupName}
    groupDescription={groupDescription}
    groupProjects={projectsList}
  />,
);

describe('test basic rendering', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that elements exist in the comp', () => {
    expect(wrapper.find('.card-title').text()).toBe(groupName);
    expect(wrapper.find('.description').text()).toBe(groupDescription);
    expect(wrapper.find('.projects-section').length).toBe(1);
  });
});

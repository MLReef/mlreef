import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import iconGrey from 'images/icon_grey-01.png';
import GroupCard from 'components/views/groupsOverview/GroupCard';
import { membersMock, projectsArrayMock } from 'testData';
import { generatePromiseResponse, sleep } from 'functions/testUtils';

const groupCardId = 1;
const groupName = 'Group-name';
const groupDescription = 'A group to contain some testing projects';
const projectsList = projectsArrayMock.projects.all;

const setup = (description) => mount(
  <MemoryRouter>
    <GroupCard
      groupId={groupCardId}
      groupPath="some-path"
      groupName={groupName}
      groupDescription={description}
      groupProjects={projectsList}
    />
  </MemoryRouter>,
);

describe('test basic rendering', () => {
  let wrapper;

  beforeEach(() => {
    jest.spyOn(global, 'fetch')
      .mockImplementation(() => generatePromiseResponse(200, true, membersMock, 50));
    wrapper = setup(groupDescription);
  });

  test('assert that elements exist in the comp', async () => {
    await sleep(60);
    wrapper.setProps({});
    expect(wrapper.find('.card-title').text()).toBe(groupName);
    expect(wrapper.find('.description').text()).toBe(groupDescription);
    expect(wrapper.find('.projects-section').length).toBe(1);
    expect(wrapper.find('.members-number').childAt(0).text()).toBe(JSON.stringify(membersMock.length));
    expect(wrapper.find('img.member-card-avatar')).toHaveLength(membersMock.length);

    wrapper.find('div[role="button"]').simulate('click');
    expect(wrapper.find('Router').props().history.location.pathname).toBe('/groups/some-path');
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

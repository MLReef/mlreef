import React from 'react';
import { mount } from 'enzyme';
import ProjectLastCommitSect from 'components/projectView/projectLastCommitSect';
import { usersArrayMock, commitMockObject } from 'testData';
import { parseToCamelCase, getTimeCreatedAgo } from 'functions/dataParserHelpers';

const commitInfoParsed = parseToCamelCase(commitMockObject);

const setup = (testCommitData = null) => mount(
  <ProjectLastCommitSect
    testCommitData={testCommitData}
    projectId={14448940}
    branch='null'
    users={usersArrayMock}
    projectDefaultBranch='master'
  />
);
  
describe('test most basic elements', () => {
  test('assert that result is empty when not commit info is set', () => {
    const wrapper = setup();
    expect(wrapper.isEmptyRender()).toBe(true);
  });
});
describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup(commitInfoParsed);
  })
  test('assert that commit info is rendered when non-null', () => {
    expect(wrapper.find('.last-commit-info')).toHaveLength(1);
    const avatarImg = wrapper.find('img.avatar-circle')
    expect(avatarImg).toHaveLength(1);
    expect((avatarImg.props.src)).toBe(commitInfoParsed.avatarUrl);
    const messageText = wrapper.find('.last-commit-name').first().text();
    const today = new Date();
    const timediff = getTimeCreatedAgo(commitInfoParsed.authoredDate, today);
    expect(messageText.includes(commitInfoParsed.message)).toBe(true);
    expect(messageText.includes(commitInfoParsed.committerName)).toBe(true);
    expect(messageText.includes(timediff)).toBe(true);
    expect(wrapper.find('.last-commit-id').text().includes(commitInfoParsed.shortId)).toBe(true);
  });
});

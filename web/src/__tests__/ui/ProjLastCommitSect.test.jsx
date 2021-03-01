import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import ProjectLastCommitSect from 'components/projectView/LastCommitSect';
import { commitMockObject, usersArrayMock } from 'testData';
import { parseToCamelCase, getTimeCreatedAgo } from 'functions/dataParserHelpers';

const commitInfoParsed = parseToCamelCase(commitMockObject);

const setup = (commitId = null) => mount(
  <MemoryRouter>
    <ProjectLastCommitSect
      projectId={14448940}
      branch="master"
      projectDefaultBranch="master"
      commitId={commitId}
    />
  </MemoryRouter>,
);

const setSpy = () => jest.spyOn(global, 'fetch').mockImplementation((request) => {
  if (request.url.includes('/commits')) {
    return new Promise((resolve) => {
      resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve([commitMockObject]),
      });
    });
  }
  return new Promise((resolve) => {
    resolve({
      status: 200,
      ok: true,
      json: () => Promise.resolve([{ ...usersArrayMock[0].userInfo }]),
    });
  });
});

describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    setSpy();
    wrapper = setup();
  });

  test('assert that commit info is rendered when non-null', () => {
    wrapper.setProps({});
    expect(wrapper.find('.last-commit-info')).toHaveLength(1);
    const avatarImg = wrapper.find('img.avatar-circle');
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

  test('assert that commit info is fetched when commit id is not null', () => {
    const wrapperLocal = setup(1);
    wrapperLocal.setProps({});

    expect(wrapper.find('.last-commit-info')).toHaveLength(1);
    expect(global.fetch.mock.calls[1][0].url.includes('commits/1')).toBe(true);
  });

  afterEach(() => {
    global.fetch.mockClear();
  });
});

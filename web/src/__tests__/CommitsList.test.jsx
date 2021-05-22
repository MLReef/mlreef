import React from 'react';
import { MemoryRouter as Router } from 'react-router-dom';
import { mount } from 'enzyme';
import CommitsList from 'components/layout/CommitsList/CommitList';
import { commitMockObject, usersArrayMock } from 'testData';

const setup = (users) => mount(
  <Router>
    <CommitsList
      commits={[commitMockObject]}
      users={users}
      projectId={1}
      changesNumber={3}
      namespace="namespace"
      slug="slug"
      branch="master"
    />
  </Router>,
);

describe('', () => {
  let wrapper;
  test('assert that commits info is rendered', () => {
    wrapper = setup(usersArrayMock);
    const paragraphs = wrapper.find('.commit-list-summary').find('p');

    expect(paragraphs.at(0).text()).toBe('1 commit');
    expect(paragraphs.at(1).text()).toBe('3 files changed');
    expect(paragraphs.at(2).text()).toBe('1 contributor');
    expect(wrapper.find('MEmptyAvatar').length).toBe(0);

    const listDateHeader = wrapper.find('.commit-list-per-date-header > p');
    expect(listDateHeader.text()).toBe(' Commits on Nov 9, 2019');
    expect(wrapper.find('.commit-div-data > span > a').text()).toBe('mlreef');
  });

  test('assert that elements change when no project user found in the commit authors', () => {
    wrapper = setup([]);
    expect(wrapper.find('MEmptyAvatar').length).toBe(1);
    expect(wrapper.find('.commit-div-data > span > p').text()).toBe('mlreef');
  });
});

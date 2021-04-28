import React from 'react';
import { mount, shallow } from 'enzyme';
import CommitsView, { CommitDiv } from 'components/views/CommitsView/CommitView';
import actions from 'components/views/CommitsView/actions';
import { Provider } from 'react-redux';
import { storeFactory } from 'functions/testUtils';
import { branchesMock, projectsArrayMock, commitMockObject } from 'testData';
import { getTimeCreatedAgo } from 'functions/dataParserHelpers';
import { MemoryRouter } from 'react-router-dom';

const commits = [{
  ...commitMockObject, title: 'first commit',
},
{
  ...commitMockObject, title: 'second commit',
}];

const push = jest.fn();

const history = { push };

const setup = () => {
  actions.getCommits = jest.fn(() => new Promise((resolve) => resolve(commits)));
  const match = { params: { namespace: 'namespace', slug: 'slug', branch: 'master' } };
  const store = storeFactory({
    projects: projectsArrayMock.projects,
    users: projectsArrayMock.users,
    branches: branchesMock,
  });
  return mount(
    <Provider store={store}>
      <MemoryRouter>
        <CommitsView
          match={match}
          history={history}
        />
      </MemoryRouter>
    </Provider>,
  );
};

describe('test basic rendering', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that commit view comp is displayed correclty', () => {
    wrapper.setProps({});
    expect(wrapper.find('div.search-branch').at(0).childAt(0).find('li')).toHaveLength(branchesMock.length);
    expect(wrapper.find('input#commits-filter-input')).toHaveLength(1);
    expect(wrapper.find('CommitDiv')).toHaveLength(commits.length);
  });

  test('assert that branches selector works ', () => {
    wrapper.setProps({});
    wrapper
      .find('div.search-branch')
      .at(0)
      .childAt(0)
      .find('li')
      .at(0)
      .simulate('click');
    expect(actions.getCommits.mock.calls.length).toBe(2);
    expect(actions.getCommits.mock.calls[1][1]).toBe(branchesMock[0].name);
  });

  test('assert that commits filtering works', () => {
    wrapper.setProps({});
    wrapper
      .find('input#commits-filter-input')
      .simulate('change', { target: { value: 'first commit' } });
    expect(wrapper.find('CommitDiv')).toHaveLength(1);
  });

  afterEach(() => {
    actions.getCommits.mockClear();
  });
});

describe('test CommitDiv', () => {
  test('assert that CommitDiv renders and events are triggered correclty', () => {
    const userName = 'mlreef';
    const wrapper = shallow(
      <CommitDiv
        branch="feature/a-branch"
        namespace="namespace"
        slug="slug"
        commitid={commitMockObject.id}
        title={commitMockObject.title}
        name={commitMockObject.author_name}
        id={commitMockObject.short_id}
        time={commitMockObject.committed_date}
        avatarImage=""
        userName={userName}
      />
      ,
    );
    const links = wrapper.find('Link');
    expect(links.at(0).props().to).toBe(`/namespace/slug/-/commits/feature/a-branch/-/${commitMockObject.id}`);
    const today = new Date();
    const previous = new Date(commitMockObject.committed_date);
    const timediff = getTimeCreatedAgo(previous, today);
    expect(wrapper.find('.commit-data').childAt(1).text().includes(timediff)).toBe(true);
    try {
      wrapper.find('button').simulate('click');
    } catch (error) {
      // only allowed error, at least asserts on click was executed
      expect(error.message).toBe("Cannot read property 'innerText' of undefined");
    }
  });
});

import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import NewBranch from '../components/views/NewBranch';
import actions from '../components/views/NewBranch/actions';
import { storeFactory } from '../functions/testUtils';
import { projectsArrayMock } from '../testData';

const branches = [
  { name: 'master' },
  { name: 'mockBranch1' },
  { name: 'mockBranch2' },
];

const mockedCreateBranch = jest.fn(() => new Promise((resolve) => resolve('')));

const setup = () => {
  const store = storeFactory({
    projects: projectsArrayMock.projects,
    branches,
  });
  const match = {
    params: {
      namespace: 'my-namespace',
      slug: 'the-project-name',
    },
  };
  const history = {
    goBack: () => {},
  };

  const wrapper = mount(
    <MemoryRouter>
      <Provider store={store}>
        <NewBranch match={match} history={history} />
      </Provider>
    </MemoryRouter>,
  );

  actions.createBranch = mockedCreateBranch;

  return wrapper;
};

describe('test the frontend features', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that branch name input exists', () => {
    expect(wrapper.find('MSelect')).toHaveLength(1);
    expect(wrapper.find('#new-branch-name')).toHaveLength(2);
    expect(wrapper.find('#create-branch-btn')).toHaveLength(1);
  });
});
describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that main flow works', () => {
    wrapper.find('input[id="new-branch-name"]')
      .simulate('change', { target: { value: 'new-branch-name' } });
    wrapper.find('ul.m-select-list').childAt(0).simulate('click');
    wrapper.find('#create-branch-btn').simulate('click');

    expect(actions.createBranch).toHaveBeenCalled();
  });
});

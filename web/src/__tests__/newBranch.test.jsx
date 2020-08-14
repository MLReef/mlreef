import React from 'react';
import { shallow } from 'enzyme';
import NewBranch from '../components/views/NewBranch';
import { storeFactory } from '../functions/testUtils';
import { projectsArrayMock } from '../testData';

const branches = [
  'master',
  'mockBranch1',
  'mockBranch2',
];

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

  const wrapper = shallow(
    <NewBranch match={match} store={store} history={history} />,
  );
  const afterDive = wrapper.dive().dive();
  return afterDive;
};

describe('test the frontend features', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that select exists', () => {
    expect(wrapper.find('MSelect')).toHaveLength(1);
  });
  test('assert that branch name input exists', () => {
    expect(wrapper.find('#new-branch-name')).toHaveLength(1);
  });
});
describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that create branch button is rendered when input pass validation', () => {
    wrapper.instance().setState({ branchSelected: 'master', newBranchName: 'master_1' });
    expect(wrapper.find('#create-branch-btn')).toHaveLength(1);
  });
});

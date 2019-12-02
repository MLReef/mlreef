import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import NewBranch from '../components/newBranch';
import { storeFactory } from '../functions/testUtils';
import { projectsArrayMock } from '../testData';

Enzyme.configure({ adapter: new Adapter() });

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
  const wrapper = shallow(
    <NewBranch store={store} />,
  );
  const afterDive = wrapper.dive().dive();
  return afterDive;
};

describe('test the frontend features', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that there exists a select', () => {
    expect(wrapper.find('GenerateSelect')).toHaveLength(1);
  });
  test('assert that there an input to enter branch name', () => {
    expect(wrapper.find('#new-branch-name')).toHaveLength(1);
  });
});
describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that create branch button is rendered when values are right', () => {
    wrapper.instance().setState({ branchSelected: 'master', newBranchName: 'master_1' });
    expect(wrapper.find('#create-branch-btn')).toHaveLength(1);
  });
});

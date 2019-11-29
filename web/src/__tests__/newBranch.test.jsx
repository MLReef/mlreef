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
  return wrapper.dive().dive();
};

describe('test the frontend features', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that component contains buttons', () => {
    expect(wrapper.find('button').length).toBe(1);
  });
  test('assert that select branches has the right number of children', () => {
    wrapper.instance().setState({ showBranches: true });
    expect(wrapper.find('li').length).toBe(4);
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

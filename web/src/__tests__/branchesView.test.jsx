import React from 'react';
import { shallow } from 'enzyme';
import 'babel-polyfill';
import BranchesView from '../components/branches-list-view/branchesView';
import { storeFactory } from '../functions/testUtils';
import { projectsArrayMock, branchesMock } from '../testData';

const setup = () => {
  const store = storeFactory({
    projects: projectsArrayMock.projects,
    branches: branchesMock,
  });
  const wrapper = shallow(
    <BranchesView store={store} />,
  );
  const afterDive = wrapper.dive().dive();
  return afterDive;
};

describe('test the frontend features', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that branches list have the correct name', () => {
    wrapper.find('.branch-title').forEach((branchTitle, index) => {
      expect(branchTitle.text().includes(branchesMock[index].name)).toBe(true);
    });
  });
  test('assert that default branch does not render buttons div', () => {
    const numberOfBranches = branchesMock.length - 1;
    expect(wrapper.find('.branch-row > .buttons')).toHaveLength(numberOfBranches);
  });
});

describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that branches are filtered after input value is changed', () => {
    const input = wrapper.find('#filter-input');
    input.value = 'master';
    const event = { currentTarget: input };
    input.simulate('change', event);
    expect(wrapper.find('.branch-row')).toHaveLength(1);
  });
});

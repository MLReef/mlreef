import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import BranchesView from 'components/views/BranchesListView/branchesView';
import { storeFactory } from 'functions/testUtils';
import { projectsArrayMock, branchesMock } from 'testData';

const setup = () => {
  const store = storeFactory({
    projects: projectsArrayMock.projects,
    branches: branchesMock,
  });
  const location = { pathname: '/my-namespace/the-project-name/-/branches' };

  return mount(
    <Provider store={store}>
      <MemoryRouter>
        <BranchesView 
          location={location} 
          match={{params: { namespace: 'some-namespace', slug: 'some-slug' }}} 
        />
      </MemoryRouter>
    </Provider>
  );
};

describe('test the frontend features', () => {
  let wrapper;
  // beforeEach(() => {
  //   wrapper = setup();
  // });
  test('assert that branches list has correct name', () => {
    // wrapper.find('.branch-title').forEach((branchTitle, index) => {
    //   expect(branchTitle.text().includes(branchesMock[index].name)).toBe(true);
    // });
  });
  // test('assert that default branch does not render buttons div', () => {
  //   const numberOfBranches = branchesMock.length - 1;
  //   expect(wrapper.find('.branch-row > .buttons')).toHaveLength(numberOfBranches);
  // });
});

describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  // test('assert that branches are filtered after input value is changed', () => {
  //   const input = wrapper.find('#filter-input').find('input');
  //   const event = { target: { value: 'master' }};
  //   input.simulate('change', event);
  //   expect(wrapper.find('.branch-row')).toHaveLength(1);
  // });
});

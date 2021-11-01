import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import EmptyProject from 'components/layout/EmptyProject/EmptyProject';
import { projectsArrayMock } from 'testData';
import { MemoryRouter } from 'react-router-dom';
import { storeFactory } from 'functions/testUtils';

const { projects: { selectedProject: project } } = projectsArrayMock;
const store = storeFactory({ ...projectsArrayMock });

store.dispatch({ type: 'LOGIN', user: {} });

const setup = () => mount(
  <Provider store={store}>
    <MemoryRouter>
      <EmptyProject
        httpUrlToRepo={project.httpUrlToRepo}
        searchableType={project.searchableType}
      />
    </MemoryRouter>,
  </Provider>,
);

describe('Test EmptyProject', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('test elements presence', () => {
    const emptyProjProps = wrapper.find('EmptyProject').props();

    expect(emptyProjProps.httpUrlToRepo).toBe(project.httpUrlToRepo);
    expect(wrapper.find('ProjectHelp')).toHaveLength(1);
  });
});

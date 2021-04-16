import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { useSelectedProject } from 'customHooks/useSelectedProject';
import { generatePromiseResponse, sleep, storeFactory } from 'functions/testUtils';
import { projectsArrayMock } from 'testData';

const TestComp = () => {
  const [project] = useSelectedProject('namespace', 'slug');
  return (
    <div>
      <p>
        {project.name}
      </p>
    </div>
  );
};

const setup = () => mount(
  <Provider store={storeFactory({ projects: { selectedProject: {} } })}>
    <TestComp />
  </Provider>,
);

describe('test hook', () => {
  let wrapper;
  beforeEach(() => {
    jest
      .spyOn(global, 'fetch')
      .mockImplementation((request) => request.url.includes('/api/v1/projects')
        ? generatePromiseResponse(200, true, projectsArrayMock.projects.selectedProject, 100)
        : generatePromiseResponse(200, true, {}, 100));
    wrapper = setup();
  });

  test('assert that the hook fetches and handles the project correctly', async () => {
    await sleep(500);
    wrapper.setProps();
    expect(wrapper.find('p').text()).toBe('demo');
  });
});

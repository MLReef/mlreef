import 'babel-polyfill';
import { storeFactory } from 'functions/testUtils';
import * as projectInfoActions from 'store/actions/projectInfoActions';
import { projectsArrayMock } from 'testData';

describe('assert state changes after project actions are called', () => {
  let store;
  beforeEach(() => {
    store = storeFactory({
      projects: {
        all: [],
        userProjects: [],
        starredProjects: [],
        selectedProject: {},
      }
    });
  });
  test('assert that projects list is set in the state', () => {
    const expectedArrayOfProjects = projectsArrayMock.projects.all;
    store.dispatch(projectInfoActions.setProjectsInfoSuccessfully(expectedArrayOfProjects));
    expect(store.getState().projects.all).toStrictEqual(expectedArrayOfProjects);
  });

  test('assert that selected project is set in the state', () => {
    const { projects: { selectedProject: expectedSelectedProj } } = projectsArrayMock;
    store.dispatch(projectInfoActions.setSelectedProjectSuccesfully(expectedSelectedProj));
    expect(store.getState().projects.selectedProject).toStrictEqual(expectedSelectedProj);
  });
});

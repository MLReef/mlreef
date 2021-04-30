import { generatePromiseResponse, sleep, storeFactory } from 'functions/testUtils';
import { usersArrayMock } from 'testData';
import * as projectInfoActions from 'store/actions/projectInfoActions';
import projectTestData from './testData.json';

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

  test('assert that projects list is set in the state', async () => {
    jest.spyOn(global, 'fetch').mockImplementation((req) => {
      const responseBody = req.url.includes('/api/v1/data-projects') 
        ? { content: [projectTestData.rawBEProjResponse] }
        : usersArrayMock;

      return generatePromiseResponse(200, true, responseBody, 50);
    });
    store.dispatch(projectInfoActions.getProjectsList(0, 10));
    await sleep(60);

    const { projects } = store.getState();
    expect(projects.all[0].id).toBe('5d005488-afb6-4a0c-852a-f471153a04b5');
  });

  test('assert that get list of projects actually work with for first page', async () => {
    jest.spyOn(global, 'fetch').mockImplementation((req) => {
      const responseBody = req.url.includes('/api/v1/projects/mlreef/sign-language-classifier')
        ? projectTestData.rawBEProjResponse
        : projectTestData.rawGitlabProjResponse;

      return generatePromiseResponse(200, true, responseBody, 50);
    });
    await store.dispatch(projectInfoActions.getProjectDetailsBySlug('mlreef', 'sign-language-classifier'));
    const { selectedProject } = store.getState().projects;
    expect(selectedProject.gid).toBe(2);
    expect(selectedProject.id).toBe('5d005488-afb6-4a0c-852a-f471153a04b5');
    expect(selectedProject.name).toBe(projectTestData.rawBEProjResponse.name);
    expect(selectedProject.searchableType).toBe(projectTestData.rawBEProjResponse.searchable_type);
    expect(selectedProject.gitlab.id).toBe(2);
    expect(selectedProject.gitlab.defaultBranch).toBe(null);
    expect(selectedProject.gitlab.namespace)
      .toStrictEqual(
        projectTestData.rawGitlabProjResponse.namespace,
      );
  });

  
  afterEach(() => {
    global.fetch.mockClear();
  });
});

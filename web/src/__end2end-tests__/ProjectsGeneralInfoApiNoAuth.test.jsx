import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';

const INITIAL_PAGE = 1;
const SIZE = 5;

const projectApi = new ProjectGeneralInfoApi();

let firstProject;

describe('Visitor', () => {
  test('can list public projects without pagination', async () => {
    const projects = await projectApi.getProjectsList('/public');

    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length > 0).toBe(true);
  });

  test('can list public projects with pagination', async () => {
    const pagination = `page=${INITIAL_PAGE}&size=${SIZE}`;
    const response = await projectApi.getProjectsList(`/public?${pagination}`);
    const projects = response.content;

    firstProject = projects[0];

    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length > 0).toBe(true);
    expect(response.number).toBe(INITIAL_PAGE);
    expect(response.size).toBe(SIZE);
  });

  test('can access to the first project', async () => {
    const {
      slug,
      gitlab_namespace: namespace,
    } = firstProject;

    const response = await projectApi.getProjectDetails(namespace, slug);

    expect(response.slug).toBe(slug);
    expect(response.gitlab_namespace).toBe(namespace);
  });
});

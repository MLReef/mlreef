import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';

const INITIAL_PAGE = 1;
const SIZE = 5;

const projectApi = new ProjectGeneralInfoApi();

describe('Visitor', () => {
  test('can list public projects with pagination and request details', async () => {
    const pagination = `page=${INITIAL_PAGE}&size=${SIZE}`;
    const response = await projectApi.getProjectsList(`/public?${pagination}`);
    const projects = response.content;
    console.log(`Projects accessed by visitor ${JSON.stringify(projects)}`);

    const firstProject = projects[0];

    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length > 0).toBe(true);
    expect(response.number).toBe(INITIAL_PAGE);
    expect(response.size).toBe(SIZE);

    const {
      slug,
      gitlab_namespace: namespace,
    } = firstProject;

    const projectDetailsRes = await projectApi.getProjectDetails(namespace, slug);

    expect(projectDetailsRes.slug).toBe(slug);
    expect(projectDetailsRes.gitlab_namespace).toBe(namespace);
  });
});

import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';

const projectApi = new ProjectGeneralInfoApi();

beforeAll(async () => {
  console.log('Running end2end tests against localhost:80 -> expecting proxy to redirect to $INSTANCE_HOST');
});

test('Can get public projects ', async () => {
  jest.setTimeout(30000);

  const projects = await projectApi.listPublicProjects();
  expect(projects.length > 0).toBe(true);
});

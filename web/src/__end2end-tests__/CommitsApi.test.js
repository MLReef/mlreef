import CommitsApi from 'apis/CommitsApi.ts';
import assureUserRegistration, { assureTestDataProject } from './fixtures/testHelpers';

const commitApi = new CommitsApi();
let project;
jest.setTimeout(30000);

beforeAll(async () => {
  // ----------- login with newly create user ----------- //
  await assureUserRegistration();
  project = await assureTestDataProject();
  console.log(`Running Commits tests against project: ${project.url}`);
});

test('Can commit files ', async () => {
  const response = await commitApi.performCommit(
    project.gitlab_id,
    'data/text.txt',
    '####',
    'master',
    'Can commit files',
    'create',
  );
  expect(response.title).toBe('Can commit files');
  expect(response.project_id).toBe(project.gitlab_id);
});

test('Can get commits', async () => {
  const response = await commitApi.getCommits(
    project.gitlab_id,
    'master',
  );

  // expect exactly 1 commit from the previous test
  expect(response.length).toBe(1);
});

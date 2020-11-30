import waitForExpect from 'wait-for-expect';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import assureUserRegistration from './fixtures/testHelpers';

const projectInfoApi = new ProjectGeneralInfoApi();

let gitlabGroupName = 'mlreef-group';
let gitlabProjectName = 'mlreef';
let projectResponse;
let regsitryResponse;

jest.setTimeout(100000);


test('Check whether Gitlabs returns project for given group and project name', async () => {
  let resp = [];
  setTimeout(async () => {
    const response = await projectInfoApi.getSingleProjectInfo(gitlabGroupName, gitlabProjectName);
    resp = response;
    projectResponse = response;
  }, 50000);

  await waitForExpect(() => {
    expect(projectResponse.name).toBe(gitlabProjectName);
  }, 50000);
  console.log(`Running EPF local registry tests against project: ${projectResponse.http_url_to_repo}`);
  console.log(`The project ID : ${projectResponse.id}`);
  console.log(resp);
});

test('Check whether Gitlabs docker registry lists the new image', async () => {
  let resp = [];
  setTimeout(async () => {
    console.log(`The project ID : ${projectResponse.id}`);
    const response = await projectInfoApi.getGitlabRegistries(projectResponse.id);
    resp = response;
    regsitryResponse = response;
  }, 50000);

  await waitForExpect(() => {
    expect(resp.length > 0).toBeTruthy();
  }, 50000);
  console.log(resp);
});

test('Verify if container tags are created inside registry', async () => {
  const response = await projectInfoApi.getGitlabRegistryTags(projectResponse.id, regsitryResponse[0].id);
  console.log(response);
  expect(response.length > 0).toBeTruthy();
});

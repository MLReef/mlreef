import { EXTERNAL_ROOT_URL } from 'apiConfig';
import uuidv1 from 'uuid/v1';
import CodeProjectPublishingApi from './apiMocks/CodeProjectPublishing.spike.ts';
import CommitsApiMock from './apiMocks/CommitMocks.spike.ts';
import ProjectApiMockSpike from './apiMocks/ProjectApiMock.spike.ts';
import UserApi from './apiMocks/UserApi.ts';

const api = new CodeProjectPublishingApi();
const userApi = new UserApi();
const projectApi = new ProjectApiMockSpike();
const commitsApiMock = new CommitsApiMock();

beforeAll(async () => {
  console.log('Running end2end tests against localhost:80 -> expecting proxy to redirect to $INSTANCE_HOST');
});
test('Can create new user, new code project, commit file and publish code project', async () => {
  jest.setTimeout(30000);
  // ------------- create the user ------------- //
  const suffix = uuidv1().toString().split('-')[0];
  const username = `TEST-Node.${suffix}`;
  const password = 'password';
  const email = `aqui.va.${suffix}@gmail.com`;
  const registerData = {
    username,
    email,
    password,
    name: 'Test User Node',
  };
  const registerResp = await userApi.register(registerData);
  expect(registerResp.ok).toBeTruthy();

  //
  // ----------- login with the user ----------- //
  const loginData = {
    username,
    email,
    password,
  };
  const loginResp = await userApi.login(loginData);
  expect(loginResp.ok).toBe(true);
  const resgistrationBody = await loginResp.json();
  expect(resgistrationBody.access_token).toBeDefined();

  const headers = {
    'Content-type': 'Application/json',
    'PRIVATE-TOKEN': `Bearer ${resgistrationBody.access_token}`,
    Authorization: `Bearer ${resgistrationBody.access_token}`,
  };

  //
  // ----------- create a new project ----------- //
  //
  const body = JSON.stringify({
    name: 'Just a testing project 1',
    slug: 'just-a-testing-project-1',
    namespace: 'andres.ausecha',
    initialize_with_readme: true,
    description: '',
    visibility: 'public',
    input_data_types: [],
  });
  const projectCreationResp = await projectApi.create(headers, body);
  const creationProjRespBody = await projectCreationResp.json();
  expect(projectCreationResp.ok).toBeTruthy();

  const { id: projectId, gitlab_id: gid } = creationProjRespBody;

  //
  // -------- Commit the project recently created -------- //
  //
  const commitResp = await commitsApiMock.performCommit(
    gid,
    'README.md',
    `File committed by ${username}`,
    'master',
    'some message',
    'update',
    'text',
    headers,
  );

  expect(commitResp.ok).toBeTruthy();

  //
  // -------- Publish the Project -------- //
  //
  const publishingRes = await api.publish(
    headers,
    projectId,
    JSON.stringify({
      name: 'Just a testing project 1',
      slug: 'just-a-testing-project-1',
      namespace: 'andres.ausecha',
      initialize_with_readme: true,
      description: '',
      visibility: 'public',
      input_data_types: [],
    }),
  );

  console.log('################### Publishing Response');
  console.log(publishingRes);
  console.log('################### Publishing Response Body');
  console.log(await publishingRes.json());
  expect(publishingRes.ok).toBeTruthy();

  //
  // -------- Verify Publishing status -------- //
  //
  console.log('################### Get Project');
  const projectReadResponse = await projectApi.get(headers, projectId);
  expect(projectReadResponse.ok).toBeTruthy();

  //
  // -------- Remove project at the end of the test -------- //
  //  At least removing the project automatically we do not fill the database of garbage
  //
//  const projDeletionResp = await projectApi.delete(projectId, headers);
//  expect(projDeletionResp.ok).toBeTruthy();
});

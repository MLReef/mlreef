import store from 'store';
import waitForExpect from 'wait-for-expect';
import * as types from 'actions/actionTypes';
import MLRAuthApi from 'apis/MLAuthApi';
import GitlabPipelineApi from 'apis/GitlabPipelinesApi';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import CommitsApi from 'apis/CommitsApi';
import CodeProjectPublishingApi from './apiMocks/CodeProjectPublishing.spike.ts';
import ProjectApiMockSpike from './apiMocks/ProjectApiMock.spike.ts';
import UserApi from './apiMocks/UserApi.ts';
import assureUserRegistration from './fixtures/testHelpers';

const api = new CodeProjectPublishingApi();
const userApi = new UserApi();
const authApi = new MLRAuthApi();
const projectApi = new ProjectApiMockSpike();
const commitsApi = new CommitsApi();
const gitlabApiMock = new GitlabPipelineApi();
const projectInfoApi = new ProjectGeneralInfoApi();

// TODO: this part is necessary to supply the API mocks with credentials
// As the apiMocks are removed from this test, these lines can also be removed
// eslint-disable-next-line camelcase
let removeMe_user;
// eslint-disable-next-line camelcase
let removeMe_email;
// eslint-disable-next-line camelcase
let removeMe_pass;
// end todo
let gitlabProjectId;

let regsitryResponse;

beforeAll(async () => {
  // ----------- login with newly create user ----------- //
  console.log('Running end2end tests against localhost:80 -> expecting proxy to redirect to $INSTANCE_HOST');
  const { registerData: respData } = await assureUserRegistration();
  const { username, email, password } = respData;

  // TODO: this part is necessary to supply the API mocks with credentials
  // As the apiMocks are removed from this test, these lines can also be removed
  // eslint-disable-next-line camelcase
  removeMe_user = username;
  // eslint-disable-next-line camelcase
  removeMe_email = email;
  // eslint-disable-next-line camelcase
  removeMe_pass = password;
  // end todo
});

test('Can create new user, new code project, commit file and publish code project', async () => {
  jest.setTimeout(300000);

  //
  // ----------- login with the user ----------- //
  // TODO: this part is necessary to supply the API mocks with credentials
  // As the apiMocks are removed from this test, these lines can also be removed
  // eslint-disable-next-line camelcase
  const loginData = {
    username: removeMe_user,
    email: removeMe_email,
    password: removeMe_pass,
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
    name: 'Can publish code project',
    slug: 'can-publish-code-project',
    namespace: '',
    initialize_with_readme: true,
    description: '',
    visibility: 'public',
    input_data_types: [],
  });
  const projectCreationResp = await projectApi.create(headers, body);
  const creationProjRespBody = await projectCreationResp.json();
  expect(projectCreationResp.ok).toBeTruthy();

  const { id: projectId, gitlab_id: gid } = creationProjRespBody;
  gitlabProjectId = creationProjRespBody?.gitlab_id;

  //
  // -------- Commit the project recently created -------- //
  //
  const commitDataProcessorResp = await commitsApi.performCommit(
    gid,
    'dataproc.py',
    // eslint-disable-next-line camelcase
    `
@data_processor(
    name="Resnet 2.0 Filter",
    author="MLReef",
    type="ALGORITHM",
    description="Transforms images with lots of magic",
    visibility="PUBLIC",
    input_type="IMAGE",
    output_type="IMAGE"
)
@parameter(name="cropFactor", type="Float", required=True, defaultValue=1)
@parameter(name="imageFiles", type="List",required=True, defaultValue="[]")
@parameter(name="optionalFilterParam", type="Integer", required=True, defaultValue=1)
def myCustomOperationEntrypoint(cropFactor, imageFiles, optionalFilterParam=1):
    print("stuff happening here")
    # output is not exported via return, but rather as Files.
    # we have to provide a way to store and chain outputs to the next input

myCustomOperationEntrypoint(epfInputArray)`,
    'master',
    'Data processor',
    'create',
    'text',
  );

  expect(commitDataProcessorResp.title).toBe('Data processor');
  expect(commitDataProcessorResp.project_id).toBe(gid);

  //
  // -------- Publish the Project -------- //
  //
  const publishingRes = await api.publish(
    headers,
    projectId,
    null
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
  console.log('################### Print Json Response');
  const projectBody = await projectReadResponse.json()
  console.log(projectBody);
  console.log('################### Assert dataOperation exists');
  /* { id: '723076c6-eee5-11ea-adc1-0242ac120002',
        slug: 'commons-txt-ops',
        url: 'http://ec2-18-157-161-187.eu-central-1.compute.amazonaws.com:10080/mlreef/commons-txt-ops',
        owner_id: 'aaaa0000-0001-0000-0000-cccccccccccc',
        name: 'Text processing operations',
        gitlab_namespace: 'mlreef',
        gitlab_path: 'commons-txt-ops',
        gitlab_id: 1,
        visibility_scope: 'PUBLIC',
        description:         'Removes numbers,tokenization,numbers to words, filter words.',
        tags: [],
        stars_count: 0,
        forks_count: 0,
        input_data_types: [ 'IMAGE' ],
        output_data_types: [ 'IMAGE' ],
        searchable_type: 'CODE_PROJECT',
        data_processor:
         { id: '72307a68-eee5-11ea-adc1-0242ac120002',
           slug: 'commons-txt-ops',
           name: 'Text processing operations',
           input_data_type: 'TEXT',
           output_data_type: 'TEXT',
           type: 'OPERATION',
           visibility_scope: 'PUBLIC',
           description:
            'Removes numbers,tokenization,numbers to words, filter words.',
           code_project_id: '723076c6-eee5-11ea-adc1-0242ac120002',
           author_id: 'aaaa0000-0001-0000-0000-cccccccccccc' } },
   */

  expect(projectBody.name !== undefined).toBeTruthy();
  // TODO: make the following line work
  // expect(projectBody.data_processor !== undefined).toBeTruthy();

  //
  // -------- Remove project at the end of the test -------- //
  //  At least removing the project automatically we do not fill the database of garbage
  //
  // const projDeletionResp = await projectApi.delete(projectId, headers);
  // expect(projDeletionResp.ok).toBeTruthy();
});

test('Verify whether gitlab starts a pipeline', async () => {
  let resp = [];
  setTimeout(async () => {
    const response = await gitlabApiMock.getPipesByProjectId(gitlabProjectId);
    resp = response;
  }, 200000);

  await waitForExpect(() => {
    expect(resp.length > 0).toBeTruthy();
  }, 200000, 500);
});

test('Check whether Gitlabs docker registry lists the new image', async () => {
  let resp = [];
  setTimeout(async () => {
    const response = await projectInfoApi.getGitlabRegistries(gitlabProjectId);
    resp = response;
    regsitryResponse = response;
  }, 200000);

  await waitForExpect(() => {
    expect(resp.length > 0).toBeTruthy();
  }, 200000, 500);
});

test('Verify if container tags are created inside registry', async () => {
  const response = await projectInfoApi.getGitlabRegistryTags(gitlabProjectId, regsitryResponse[0].id);
  console.log(response);
  expect(response.length > 0).toBeTruthy();
});

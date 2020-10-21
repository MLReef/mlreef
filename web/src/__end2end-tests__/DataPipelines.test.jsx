import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import uuidv1 from 'uuid/v1';
import waitForExpect from 'wait-for-expect';
import store from 'store';
import * as types from 'actions/actionTypes';
import MLRAuthApi from 'apis/MLAuthApi';
import CommitsApi from 'apis/CommitsApi.ts';
import DataPipelineApi from 'apis/DataPipelineApi';
import JobsApi from 'apis/JobsApi';
import UserApi from './apiMocks/UserApi.ts';

const userApi = new UserApi();
const authApi = new MLRAuthApi();
const projectApi = new ProjectGeneralInfoApi();
const commitApi = new CommitsApi();
const dataPipelineApi = new DataPipelineApi();
const jobApi = new JobsApi();

let project;
// {
//   id: '4aeff3dd-53ea-4fe0-8d38-976de7ec0158',
//   slug: 'can-create-project',
//   url: 'http://ec2-3-127-37-169.eu-central-1.compute.amazonaws.com:10080/TEST-ProjectGeneralInfoApi.4edcf290/can-create-project',
//   owner_id: '09c0b777-31e8-4420-813c-89db7c75314c',
//   name: 'Can create project',
//   gitlab_namespace: 'TEST-ProjectGeneralInfoApi.4edcf290',
//   gitlab_path: 'can-create-project',
//   gitlab_id: 51,
//   visibility_scope: 'PRIVATE',
//   description: '',
//   tags: [],
//   stars_count: 0,
//   forks_count: 0,
//   input_data_types: [],
//   output_data_types: [],
//   searchable_type: 'DATA_PROJECT',
//   experiments: [],
// }

let pipeline;
// {
//   commit: 'null'
//   data_operations: []
//   data_project_id: '8cb62300-1994-4ddd-8c08-33780fff942e'
//   id: "2656704e-4ed4-43aa-8fcf-cf5f6d62bf5d"
//   input_files: [{location: 'data/', location_type: 'PATH'}]
//   name: 'data-pipeline/test-pipeline'
//   number: 1
//   pipeline_config_id: '67271181-ca68-4c5a-851d-62db15815c70'
//   pipeline_job_info: {
//     commit_sha: '17fbda12306d211a4f29d617db1a2fef30072385'
//     created_at: '2020-10-14T15:17:07.486Z'
//     id: 46
//     ref: 'data-pipeline/test-pipeline-1'
//     updated_at: '2020-10-14T15:17:07.617Z'
//   }
//   pipeline_type: 'DATA'
//   slug: 'data-pipeline-test-pipeline-1'
//   source_branch: 'master'
//   status: 'PENDING'
//   target_branch: 'data-pipeline/test-pipeline-1'
// }

jest.setTimeout(100000);
beforeAll(async () => {
  // ------------- create the user ------------- //
  const suffix = uuidv1().toString().split('-')[0];
  const username = `TEST-ProjectGeneralInfoApi.${suffix}`;
  const password = 'password';
  const email = `TEST-Node.${suffix}@example.com`;
  const registerData = {
    username,
    email,
    password,
    name: username,
  };
  const registerResponse = await userApi.register(registerData);
  expect(registerResponse.ok).toBeTruthy();

  // ----------- login with newly create user ----------- //
  if (!store.getState().user.isAuth) {
    await authApi.login(username, email, password)
      .then((user) => store.dispatch({ type: types.LOGIN, user }));
  }

  const request = {
    name: 'Data Pipelines test project',
    slug: 'can-create-project',
    namespace: '',
    initialize_with_readme: false,
    description: '',
    visibility: 'private',
    input_data_types: [],
  };

  const response = await projectApi.create(request, 'data-project', false)
    .catch((err) => {
      expect(true).not.toBe(true);
      return err;
    });

  expect(response.name).toBe(request.name);
  expect(response.slug).toBe(request.slug);

  project = response;
  console.log(`Running Pipeline tests against project: ${project.url}`);

  const commit = await commitApi.performCommit(
    project.gitlab_id,
    'data/text.txt',
    '####',
    'master',
    'Add mock data file',
    'create',
  );
  expect(commit.title).toBe('Add mock data file');
  expect(commit.project_id).toBe(project.gitlab_id);
});

test('Can create empty data pipeline', async () => {
  const body = {
    name: 'test-pipeline',
    source_branch: 'master',
    pipeline_type: 'DATA',
    input_files: [{
      location: 'data/',
    }],
    data_operations: [],
  };
  const response = await (await dataPipelineApi.create(project.id, body)).json();
  expect(response.name).toBe('data-pipeline/test-pipeline');
  expect(response.pipeline_type).toBe('DATA');
  expect(response.slug).toBe('data-pipeline-test-pipeline-1');
  expect(response.data_operations.length).toBe(0);
});

test('Project has exactly one pipeline after pipeline creatio', async () => {
  // This test relies on the previous tests to create a data pipeline
  const response = await dataPipelineApi.getProjectPipelines(project.id);

  expect(response.length).toBe(1);
  expect(response[0].name).toBe('data-pipeline/test-pipeline');
  expect(response[0].pipeline_type).toBe('DATA');
  expect(response[0].slug).toBe('data-pipeline-test-pipeline');
  expect(response[0].data_operations.length).toBe(0);
});

test('Can get Pipeline Instance for created data pipeline', async () => {
  // This test relies on the previous tests to create a data pipeline
  let resp = [];
  setTimeout(async () => {
    const response = await jobApi.getPerProject(project.gitlab_id);
    resp = response;
  }, 50000);

  await waitForExpect(() => {
    expect(resp.length > 0).toBeTruthy();
  }, 50000);
  console.log(resp);
});

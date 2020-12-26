import { PROJECT_TYPES } from 'domain/project/projectTypes';
import GitlabPipelineApi from 'apis/GitlabPipelinesApi';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import CommitsApi from 'apis/CommitsApi';
import waitForExpect from 'wait-for-expect';
import assureUserRegistration from './fixtures/testHelpers';
import EnvironmentsApi from 'apis/EnvironmentsApi';

const commitsApi = new CommitsApi();
const gitlabApi = new GitlabPipelineApi();
const projectInfoApi = new ProjectGeneralInfoApi();

jest.setTimeout(300000);

test('Can create new user, new code project, commit file and publish code project', async () => {
  // ----------- login with newly create user ----------- //
  console.log('Running end2end tests against localhost:80 -> expecting proxy to redirect to $INSTANCE_HOST');
  const { registerData: respData } = await assureUserRegistration();
  const { username } = respData;
  console.log(`user info: ${JSON.stringify(respData)}`);
  //
  // ----------- create a new project ----------- //
  //
  const body = {
    name: 'Can publish code project',
    slug: 'can-publish-code-project',
    namespace: username,
    initialize_with_readme: true,
    description: 'Generated description',
    visibility: 'public',
    input_data_types: ['HIERARCHICAL'],
    data_processor_type: 'ALGORITHM',
  };

  const creationProjRespBody = await projectInfoApi.create(body, PROJECT_TYPES.CODE_PROJ);

  console.log(`Project recently created: ${JSON.stringify(creationProjRespBody)}`);
  const { id: projectId, gitlab_id: gid } = creationProjRespBody;

  //
  // -------- Commit the project recently created -------- //
  //
  const commitDataProcessorResp = await commitsApi.performCommit(
    gid,
    'dataproc.py',
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


  // ---------------------- Get the environments ------------------ //

  const envs = await EnvironmentsApi.getMany();
  expect(envs.length > 0).toBe(true);

  //
  // -------- Publish the Project -------- //
  //

  const publishingRes = await projectInfoApi.publish(
    projectId,
    {
      path: 'dataproc.py',
      environment: envs[0].id,
      model_type: null,
      ml_category: null,
      accepted_publishing_terms: null,
    },
  );

  console.log('################### Publishing Response');
  console.log(publishingRes);

  console.log('################### Get Project');
  const projectReadResponse = await projectInfoApi.getCodeProjectById(projectId);
  console.log(JSON.stringify(projectReadResponse));
  expect(projectReadResponse.name !== undefined).toBeTruthy();

  // --------------- Verify whether gitlab starts a pipeline --------------- //

  const response = await gitlabApi.getPipesByProjectId(gid);
  expect(response.length > 0).toBeTruthy();

  let registryResponse = [];
  let tagsResponse = [];

  // ------------------ Verify Gitlab registry responses --------------------- //

  setTimeout(async () => {
    registryResponse = await projectInfoApi.getGitlabRegistries(gid);
  }, 60000);

  await waitForExpect(() => {
    expect(registryResponse.length > 0).toBeTruthy();
  });

  tagsResponse = await projectInfoApi
    .getGitlabRegistryTags(
      gid,
      registryResponse[0].id,
    );
  console.log(tagsResponse);
  expect(tagsResponse.length > 0).toBeTruthy();
});

import BranchesApi from 'apis/BranchesApi';
import CommitsApi from 'apis/CommitsApi.ts';
import DataPipelineApi from 'apis/DataPipelineApi';
import waitForExpect from 'wait-for-expect';
import assureUserRegistration, { assureTestDataProject } from './fixtures/testHelpers';

const commitApi = new CommitsApi();
const dataPipelineApi = new DataPipelineApi();
const brApi = new BranchesApi();

let username;

let project;

jest.setTimeout(300000);

let hasFiles = false;

describe('test the pipelines environment', () => {
  beforeEach(async () => {
    const user = await assureUserRegistration();
    username = user.registerData.username;
    project = await assureTestDataProject();

    if (!hasFiles) {
      await commitApi.performCommit(
        project.gitlab_id,
        'data/text.txt',
        '####',
        'master',
        'Add mock data file',
        'create',
      );
      hasFiles = true;
    }
  });

  test('Can create empty data pipeline', async () => {
    console.log(project);

    const body = {
      name: 'test-pipeline',
      source_branch: 'master',
      pipeline_type: 'DATA',
      input_files: [{
        location: 'data/text.txt',
        location_type: 'PATH_FILE',
      }],
      data_operations: [
        {
          parameters: [
            {
              name: 'input-path',
              value: 'data/text.txt',
            },
            {
              name: 'output-path',
              value: '.',
            },
            {
              name: 'stemmed',
              value: 'FALSE',
            },
            {
              name: 'filternums',
              value: 'FALSE',
            },
            {
              name: 'num2words',
              value: 'FALSE',
            },
            {
              name: 'stopwords',
              value: 'TRUE',
            },
          ],
          slug: 'commons-txt-ops',
        },
      ],
    };
    const pipelineCreationResponse = await dataPipelineApi.create(project.id, body);
    console.log(JSON.stringify(pipelineCreationResponse));
    expect(pipelineCreationResponse.name).toBe('data-pipeline/test-pipeline');
    expect(pipelineCreationResponse.pipeline_type).toBe('DATA');
    expect(pipelineCreationResponse.slug).toBe('data-pipeline-test-pipeline-1');
    expect(pipelineCreationResponse.data_operations.length).toBe(1);

    const dataPipelinesFetched = await dataPipelineApi.getProjectPipelines(project.id);
    console.log(JSON.stringify(dataPipelinesFetched));
    expect(dataPipelinesFetched.length).toBe(1);
    const first = dataPipelinesFetched[0];
    expect(first.name).toBe('data-pipeline/test-pipeline');
    expect(first.pipeline_type).toBe('DATA');
    expect(first.slug).toBe('data-pipeline-test-pipeline');
    expect(first.data_operations.length).toBe(1);

    let gitlabPipelineBranches = await brApi.getBranches(project.gitlab_id);
    await waitForExpect(() => {
      console.log('gitlabPipelineBranches: ', JSON.stringify(gitlabPipelineBranches));
      expect(
        gitlabPipelineBranches
          .filter((branch) => branch.name === 'data-pipeline/test-pipeline-1').length
      ).toBeGreaterThan(0);
    });
  });
});

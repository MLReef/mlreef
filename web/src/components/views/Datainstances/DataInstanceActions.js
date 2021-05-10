import DataPipelineApi from 'apis/DataPipelineApi';
import GitlabPipelinesApi from 'apis/GitlabPipelinesApi';
import JobsApi from 'apis/JobsApi';
import { parseToCamelCase } from 'functions/dataParserHelpers';

const dataPipelineApi = new DataPipelineApi();
const gitlabPipelines = new GitlabPipelinesApi();
const jobsApi = new JobsApi();

/**
 *
 * @param {*} pipelineBackendId
 * @param {*} backendInstanceId
 */

const deleteDataInstance = (
  pipelineBackendId,
  backendInstanceId,
) => dataPipelineApi
  .delete(pipelineBackendId, backendInstanceId);

/**
 *
 * @param {*} gitlabProjectId
 * @param {*} backendPipelineId
 * @param {*} pipelineInstanceId
 * @param {*} gitlabPipelineId
 */

const abortDataInstance = (
  gitlabProjectId,
  backendPipelineId,
  pipelineInstanceId,
  gitlabPipelineId,
) => gitlabPipelines.abortGitlabPipelines(
  gitlabProjectId,
  gitlabPipelineId,
).then(() => dataPipelineApi.cancel(backendPipelineId, pipelineInstanceId));

/**
 *
 * @param {*} gitlabId: project id
 * @param {*} dataId: backend pipeline id
 */

const getDataInstanceAndAllItsInformation = (
  gitlabId,
  dataId,
) => dataPipelineApi.getBackendPipelineById(dataId)
  .then(parseToCamelCase)
  .then((backendPipe) => gitlabPipelines
    .getPipesById(gitlabId, backendPipe?.instances[0]?.pipeline_job_info?.id)
    .then((res) => {console.log(res); return res})
    .then(({
      created_at: timeCreatedAgo,
      id,
      status,
      ref,
      updated_at: updatedAt,
    }) => ({
      ...backendPipe,
      timeCreatedAgo,
      gitlabPipelineId: id,
      diStatus: status,
      branchName: ref,
      updatedAt,
    })));

const fetchDatapipelineLastJob = (
  gid, gitlabPipelineId,
) => jobsApi
  .getJobsByPipelineId(gid, gitlabPipelineId).then((list) => list[list.length - 1]);

export default {
  abortDataInstance,
  deleteDataInstance,
  getDataInstanceAndAllItsInformation,
  fetchDatapipelineLastJob,
};

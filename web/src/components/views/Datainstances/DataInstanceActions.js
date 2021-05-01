import DataPipelineApi from 'apis/DataPipelineApi';
import GitlabPipelinesApi from 'apis/GitlabPipelinesApi';
import { SKIPPED } from 'dataTypes';
import { parseToCamelCase } from 'functions/dataParserHelpers';

const dataPipelineApi = new DataPipelineApi();
const gitlabPipelines = new GitlabPipelinesApi();

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
  .then((backendPipe) => gitlabPipelines.getPipesByProjectId(gitlabId)
    .then((pipes) => pipes
      .filter((pipeline) => pipeline
        .ref
        .includes(backendPipe?.name) && pipeline.status !== SKIPPED)[0])
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

export default {
  abortDataInstance,
  deleteDataInstance,
  getDataInstanceAndAllItsInformation,
};

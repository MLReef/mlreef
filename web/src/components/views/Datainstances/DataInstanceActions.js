import BranchesApi from 'apis/BranchesApi';
import DataPipelineApi from 'apis/DataPipelineApi';
import GitlabPipelinesApi from 'apis/GitlabPipelinesApi';
import { SKIPPED } from 'dataTypes';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import { classifyPipeLines } from 'functions/pipeLinesHelpers';

const dataPipelineApi = new DataPipelineApi();
const gitlabPipelines = new GitlabPipelinesApi();
const brApi = new BranchesApi();

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

const getDataInstances = (
  backendProjectId,
  gilabProjectId,
) => dataPipelineApi.getProjectPipelines(backendProjectId)
  .then((backendPipelines) => backendPipelines.filter((pipe) => pipe.pipeline_type === 'DATA'))
  .then((dataPipelines) => dataPipelines.filter((pipe) => pipe.instances.length > 0))
  .then((dataPipelines) => dataPipelines.map((dp) => ({
    ...dp, dataInstanceId: dp.instances[0].id,
  })))
  .then((dataPipelineInstances) => brApi
    .getBranches(gilabProjectId)
    .then((branches) => branches.filter((branch) => branch.name.startsWith('data-pipeline')))
    .then((dataPipelineBranches) => gitlabPipelines.getPipesByProjectId(gilabProjectId)
      .then((res) => classifyPipeLines(res, dataPipelineBranches, dataPipelineInstances))));

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
  getDataInstances,
  getDataInstanceAndAllItsInformation,
};

import BranchesApi from 'apis/BranchesApi';
import DataPipelineApi from 'apis/DataPipelineApi';
import GitlabPipelinesApi from 'apis/GitlabPipelinesApi';
import { classifyPipeLines } from 'functions/pipeLinesHelpers';
import { SET_VISUALIZATIONS, SET_DATAINSTANCES } from 'store/actionTypes';

const dataPipelineApi = new DataPipelineApi();
const gitlabPipelines = new GitlabPipelinesApi();
const brApi = new BranchesApi();

/**
 *
 * @param {*} backendProjectId: backend project identifier
 * @param {*} gilabProjectId: gitlab project identifier
 */

export const getDataInstances = (
  backendProjectId,
  gilabProjectId,
  pipelineType,
) => dataPipelineApi.getProjectPipelines(backendProjectId)
  .then((backendPipelines) => backendPipelines
    .filter((pipe) => pipe.pipeline_type === pipelineType))
  .then((dataPipelines) => dataPipelines.filter((pipe) => pipe.instances.length > 0))
  .then((dataPipelines) => dataPipelines.map((dp) => ({
    ...dp, dataInstanceId: dp.instances[0].id,
  })))
  .then((dataPipelineInstances) => brApi
    .getBranches(gilabProjectId)
    .then((branches) => branches.filter((branch) => branch.name.startsWith(
      `data-${pipelineType === 'VISUALIZATION' ? 'visualization' : 'pipeline'}`,
    )))
    .then((dataPipelineBranches) => gitlabPipelines.getPipesByProjectId(gilabProjectId)
      .then((res) => classifyPipeLines(res, dataPipelineBranches, dataPipelineInstances))));

/**
 *
 * @param {*} backendProjectId: backend project identifier.
 * @param {*} gilabProjectId: gitlab project identifier.
 * @param {*} pipelineType: pipeline type can take two values: DATA and VISUALIZATION.
 */

export const getProjectPipelinesByType = (
  backendProjectId,
  gilabProjectId,
  pipelineType,
) => (dispatch) => getDataInstances(backendProjectId, gilabProjectId, pipelineType)
  .then((pipes) => dispatch(pipelineType === 'VISUALIZATION'
    ? { type: SET_VISUALIZATIONS, visualizations: pipes }
    : { type: SET_DATAINSTANCES, datainstances: pipes }));

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { handleResponse } from 'functions/helpers';
import ApiDirector from 'apis/ApiDirector';
import ApiRequestCallBuilder from 'apis/apiBuilders/ApiRequestCallBuilder';
import BLApiRequestCallBuilder from 'apis/apiBuilders/BLApiRequestCallBuilder';
import { METHODS, validServicesToCall } from 'apis/apiBuilders/requestEnums';

export default class DataPiplineApi extends ApiDirector {
  /**
   * https://mlreef.gitlab.io/backend/develop/#_post_pipelines
   * @param projectUUId
   * @param body
   * @returns PipelineInstance !!
   */
  async create(projectUUId: number, body: any) {
    const url = `/api/v1/data-projects/${projectUUId}/pipelines/create-start-instance`;
    const data = { ...body };
    const BLbuilder = new ApiRequestCallBuilder(METHODS.POST, this.buildBasicHeaders(validServicesToCall.BACKEND), url, JSON.stringify(data));
    const response = await fetch(BLbuilder.build());
    if (!response.ok) {
      return Promise.reject(response);
    }
    return response;
  }

  /**
   * Pipelines of an accessible DataProject
   * @param projectUUID Id of own DataProject
   * @returns List<PipelineConfig>
   */
  async getProjectPipelines(projectUUID: number) {
    const url = `/api/v1/data-projects/${projectUUID}/pipelines`;
    const builder = new BLApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.BACKEND), url);
    const response = await fetch(builder.build());

    if (!response.ok) {
      return Promise.reject(response);
    }
    return response.json();
  }

  async getBackendPipelineById(pipelineId: string) {
    const url = `/api/v1/pipelines/${pipelineId}`;
    const builder = new BLApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.BACKEND), url);
    return fetch(builder.build())
      .then(handleResponse);
  }

  delete(backendProjectId: string, pipelineId: string) {
    const url = `/api/v1/pipelines/${backendProjectId}/instances/${pipelineId}`;
    const builder = new BLApiRequestCallBuilder(METHODS.DELETE, this.buildBasicHeaders(validServicesToCall.BACKEND), url);

    return fetch(builder.build())
      .then(handleResponse);
  }
}

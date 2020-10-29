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
  create(projectUUId: number, body: any) {
    const url = `/api/v1/data-projects/${projectUUId}/pipelines/create-start-instance`;
    const data = { ...body };
    const BLbuilder = new ApiRequestCallBuilder(METHODS.POST, this.buildBasicHeaders(validServicesToCall.BACKEND), url, JSON.stringify(data));
    
    return fetch(BLbuilder.build())
      .then(handleResponse);
  }

  /**
   * Pipelines of an accessible DataProject
   * @param projectUUID Id of own DataProject
   * @returns List<PipelineConfig>
   */
  getProjectPipelines(projectUUID: number) {
    const url = `/api/v1/data-projects/${projectUUID}/pipelines`;
    const builder = new BLApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.BACKEND), url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  getBackendPipelineById(pipelineId: string) {
    const url = `/api/v1/pipelines/${pipelineId}`;
    const builder = new BLApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.BACKEND), url);
    return fetch(builder.build())
      .then(handleResponse);
  }

  delete(pipeLineConfigId: string, pipelineId: string) {
    const url = `/api/v1/pipelines/${pipeLineConfigId}/instances/${pipelineId}`;
    const builder = new BLApiRequestCallBuilder(METHODS.DELETE, this.buildBasicHeaders(validServicesToCall.BACKEND), url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  cancel(pipeLineConfigId: string, pipelineId: string){
    const url = `/api/v1/pipelines/${pipeLineConfigId}/instances/${pipelineId}/cancel`;

    const builder = new BLApiRequestCallBuilder(METHODS.PUT, this.buildBasicHeaders(validServicesToCall.BACKEND), url);

    return fetch(builder.build())
      .then(handleResponse);
  }
}

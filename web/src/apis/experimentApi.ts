import ApiDirector from './ApiDirector';
import ApiRequestCallBuilder from './apiBuilders/ApiRequestCallBuilder';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';
import BodyLessApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import { handleResponse } from 'functions/apiCalls';

export default class ExperimentsApi extends ApiDirector {
  async createExperiment(backendId: string, body: string) {
    const builder = new ApiRequestCallBuilder(
      METHODS.POST, 
      this.buildBasicHeaders(validServicesToCall.BACKEND), 
      `/api/v1/data-projects/${backendId}/experiments`,
      JSON.stringify(body)
    );
    return fetch(builder.build())
      .then(handleResponse);
  }

  async startExperiment(dataProjectId: string, experimentId: string) {
    const builder = new BodyLessApiRequestCallBuilder(
      METHODS.POST, 
      this.buildBasicHeaders(validServicesToCall.BACKEND), 
      `/api/v1/data-projects/${dataProjectId}/experiments/${experimentId}/start`
    );
    const response = await fetch(builder.build());
    if (!response.ok) {
      return Promise.reject(response);
    }
    return response;
  }

  async getExperimentDetails(backendId: string, experimentID: string) {
    const url = `/api/v1/data-projects/${backendId}/experiments/${experimentID}`;
    const builder = new BodyLessApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.BACKEND), url);
        
    return fetch(builder.build())
      .then(handleResponse);
  }

  async getExperiments(backendId: string) {
    const url = `/api/v1/data-projects/${backendId}/experiments`;
    const builder = new BodyLessApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.BACKEND), url);
        
    return fetch(builder.build())
      .then(handleResponse);
  }

  async cancelExperiment(dataProjectId: string, experimentId: string){
    const url = `/api/v1/data-projects/${dataProjectId}/experiments/${experimentId}/cancel`;
    const builder = new BodyLessApiRequestCallBuilder(METHODS.POST, this.buildBasicHeaders(validServicesToCall.BACKEND), url);
    
    return fetch(builder.build())
      .then(handleResponse);
  }

  async delete(dataProjectId: string, experimentId: string){
    const url = `/api/v1/data-projects/${dataProjectId}/experiments/${experimentId}`;
    const builder = new BodyLessApiRequestCallBuilder(METHODS.DELETE, this.buildBasicHeaders(validServicesToCall.BACKEND), url);
    
    return fetch(builder.build())
      .then(handleResponse);
  }
}

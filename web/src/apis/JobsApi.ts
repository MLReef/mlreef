import ApiDirector from './ApiDirector';
import BodyLessApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';
import { handleResponse } from 'functions/helpers';

export default class JobsApi extends ApiDirector {
  getPerProject(projectId: number) {
    const url = `/api/v4/projects/${projectId}/jobs`;
    const blbuilder = new BodyLessApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.GITLAB), url);

    return fetch(blbuilder.build())
      .then(handleResponse);
  }

  getJobById(projectId: number, jobId: number) {
    const url = `/api/v4/projects/${projectId}/jobs/${jobId}`;
    const blbuilder = new BodyLessApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.GITLAB), url);

    return fetch(blbuilder.build())
      .then(handleResponse);    
  }

  getJobsByPipelineId(projectId: number, pipelineId: number) {
    const url = `/api/v4/projects/${projectId}/pipelines/${pipelineId}/jobs`;
    const blbuilder = new BodyLessApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.GITLAB), url);

    return fetch(blbuilder.build());
  }

  downloadArtifacts(projectId: number, refName: string, jobName: string) {
    const url = `/api/v4/projects/${projectId}/jobs/artifacts/${refName}/download?job=${jobName}`;
    const blbuilder = new BodyLessApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.GITLAB), url);

    return fetch(blbuilder.build())
      .then(handleResponse);    
  }

  getLog(projectId: number, jobId: number) {
    const url = `/api/v4/projects/${projectId}/jobs/${jobId}/trace`;
    const blbuilder = new BodyLessApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.GITLAB), url);

    return fetch(blbuilder.build());
  }
}

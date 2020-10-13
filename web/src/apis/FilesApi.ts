import ApiDirector from './ApiDirector';
import BodyLessApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';
import { handleResponse } from 'functions/helpers';

export default class FilesApi extends ApiDirector {
  async getFilesPerProject(projectId: number, path: string, recursive = false, ref: string) {
    const baseUrl = `/api/v4/projects/${projectId}/repository/tree`;
    const blBuilder = new BodyLessApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.GITLAB), baseUrl);
    const params = new Map();
    params.set('ref', ref);
    params.set('recursive', recursive);
    params.set('path', path);
    params.set('per_page', '50');
    blBuilder.setUrlParams(params);
    blBuilder.buildUrlWithParams();
    const response = await fetch(blBuilder.build());
    if (!response.ok) {
      return Promise.reject(response);
    }
    return response.json();
  }

  async getFileData(projectId: number, path: string, ref: string) {
    const url = `/api/v4/projects/${projectId}/repository/files/${path}?ref=${ref}`;
    const blBuilder = new BodyLessApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.GITLAB), url);
    return fetch(blBuilder.build())
      .then(handleResponse)
  }

  getContributors(projectId: number) {
    const url = `/api/v4/projects/${projectId}/repository/contributors`;
    const headers = this.buildBasicHeaders(validServicesToCall.GITLAB);
    const builder = new BodyLessApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }
}

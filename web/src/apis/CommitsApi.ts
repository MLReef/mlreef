import { handleResponse } from 'functions/helpers';
import ApiDirector from './ApiDirector';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';
import BLApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import ApiRequestCallBuilder from './apiBuilders/ApiRequestCallBuilder';

export default class CommitsApi extends ApiDirector {
  performCommit(
    projectId: number,
    filePath: string,
    fileContent: string,
    branch: string,
    commitMss: string,
    action: string,
    encoding: string = 'text',
    branchStart: string,
  ) {
    const body = {
      branch,
      commit_message: commitMss,
      actions: [
        {
          action,
          file_path: filePath,
          content: fileContent,
          encoding,
        },
      ],
    };
    const data = JSON.stringify(branchStart ? { ...body, start_branch: branchStart } : body);
    const url = `/api/v4/projects/${projectId}/repository/commits`;
    const blBuilder = new ApiRequestCallBuilder(
      METHODS.POST,
      this.buildBasicHeaders(validServicesToCall.GITLAB), 
      url,
      data,
    );
    return fetch(blBuilder.build())
      .then(handleResponse);
  }

  performCommitForMultipleActions(
    projectId: number,
    body: string,
  ) {
    const url = `/api/v4/projects/${projectId}/repository/commits`;
    const blBuilder = new ApiRequestCallBuilder(METHODS.POST, this.buildBasicHeaders(validServicesToCall.GITLAB), url, body);

    return fetch(blBuilder.build())
      .then(handleResponse);
  }

  getCommits(projectId: number, refName = 'master', path = '', perPage = 20) {
    const url = `/api/v4/projects/${projectId}/repository/commits?per_page=${perPage}&ref_name=${refName}&path=${path}`;
    const headers = this.buildBasicHeaders(validServicesToCall.GITLAB);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  getCommitDetails(projectId: number, commitId: number) {
    const url = `/api/v4/projects/${projectId}/repository/commits/${commitId}`;
    const headers = this.buildBasicHeaders(validServicesToCall.GITLAB);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  async getFileDataInCertainCommit(projectId: number, pathToFile: string, commitId: number) {
    const url = `/api/v4/projects/${projectId}/repository/files/${pathToFile}/raw?ref=${commitId}`;
    const builder = new BLApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.GITLAB), url);
    const response = await fetch(builder.build());

    const imageFileSize = response.headers.get('Content-Length');
    const imageArrayBuffer = await response.arrayBuffer();
    return { imageArrayBuffer, imageFileSize };
  }

  async getCommitDiff(projectId: number, commitId: number, page: number, pageable: boolean) {
    let url = `/api/v4/projects/${projectId}/repository/commits/${commitId}/diff`;
    if (pageable) {
      url = `${url}?page=${page}&per_page=10`;
    }
    const builder = new BLApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.GITLAB), url);
    const response = await fetch(builder.build());

    if (!response.ok) {
      return Promise.reject(response);
    }
    const body = await response.json();
    const totalFilesChanged = response.headers.get('x-total');
    const totalPages = response.headers.get('x-total-pages');
    return { body, totalPages, totalFilesChanged };
  }
}

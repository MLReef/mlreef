import ApiDirector from './ApiDirector';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';
import BLApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import { handleResponse } from 'functions/apiCalls';
import ApiRequestCallBuilder from './apiBuilders/ApiRequestCallBuilder';

export default class CommitsApi extends ApiDirector {
  async performCommit(
    projectId: number, 
    filePath: string,
    fileContent: string, 
    branch: string, 
    commitMss: string, 
    action: string, 
    encoding: string = 'text',
  ) {
    const data = JSON.stringify({
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
    });
    const url = `/api/v4/projects/${projectId}/repository/commits`
    const blBuilder = new ApiRequestCallBuilder(METHODS.POST, this.buildBasicHeaders(validServicesToCall.BACKEND), url, data);
    return fetch(blBuilder.build())
      .then(handleResponse);
  }

  async performCommitForMultipleActions(
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
    const builder = new BLApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.GITLAB) , url);
    const response = await fetch(builder.build());

    return response.arrayBuffer();
  }

  async getCommitDiff(projectId: number, commitId: number) {
    const url = `/api/v4/projects/${projectId}/repository/commits/${commitId}/diff`;
    
    const builder = new BLApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.GITLAB) , url);
    return fetch(builder.build())
    .then(handleResponse);
  }
}

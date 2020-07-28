import { toastr } from 'react-redux-toastr';
import ApiDirector from './ApiDirector';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';
import BLApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import { generateGetRequest, getCurrentToken, getDomain } from './apiHelpers';
import { handleResponse } from 'functions/apiCalls';

export default class CommitsApi extends ApiDirector {
  static async performCommit(projectId, filePath, fileContent, branch, commitMss, action, encoding = 'text') {
    try {
      const response = await fetch(
        `/api/v4/projects/${projectId}/repository/commits`, {
          method: 'POST',
          headers: new Headers({
            'PRIVATE-TOKEN': getCurrentToken(),
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({
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
          }),
        },
      );

      return response.ok ? response.json() : Promise.reject(response);
    } catch (err) {
      toastr.error('Error', err.message);
    }
  }

  static async performCommitForMultipleActions(
    projectId,
    body,
  ) {
    try {
      const response = await fetch(
        `/api/v4/projects/${projectId}/repository/commits`, {
          method: 'POST',
          headers: new Headers({
            'PRIVATE-TOKEN': getCurrentToken(),
            'Content-Type': 'application/json',
          }),
          body,
        },
      );
      return response.ok ? response.json() : Promise.reject(response);
    } catch (err) {
      toastr.error('Error', err.message);
    }
  }

  getCommits(projectId, refName = 'master', path = '', perPage = 20) {
    const url = `/api/v4/projects/${projectId}/repository/commits?per_page=${perPage}&ref_name=${refName}&path=${path}`;
    const headers = this.buildBasicHeaders(validServicesToCall.GITLAB);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  getCommitDetails(projectId, commitId) {
    const url = `/api/v4/projects/${projectId}/repository/commits/${commitId}`;
    const headers = this.buildBasicHeaders(validServicesToCall.GITLAB);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  static async getFileDataInCertainCommit(projectId, pathToFile, commitId) {
    const url = `${getDomain()}:10080/api/v4/projects/${projectId}/repository/files/${pathToFile}/raw?ref=${commitId}`;
    const response = await generateGetRequest(url);

    return response.arrayBuffer();
  }

  static async getCommitDiff(projectId, commitId) {
    const url = `/api/v4/projects/${projectId}/repository/commits/${commitId}/diff`;
    const response = await generateGetRequest(url);

    return response.json();
  }
}

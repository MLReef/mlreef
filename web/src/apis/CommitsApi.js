import { API_GATEWAY } from '../apiConfig';
import { toastr } from 'react-redux-toastr';
import { generateGetRequest, getCurrentToken } from './apiHelpers';

export default class CommitsApi {
  static async performCommit(projectId, filePath, fileContent, branch, commitMss, action, encoding = 'text') {
    try {
      const response = await fetch(
        `${API_GATEWAY}/api/v4/projects/${projectId}/repository/commits`, {
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

      return response.ok ? response.json() : Promise.reject(response)
    } catch (err) {
      toastr.error("Error", err.message);
    }
  }

  static async getCommits(projectId, refName = 'master', path = '', perPage = 20) {
    const url = `${API_GATEWAY}/api/v4/projects/${projectId}/repository/commits?per_page=${perPage}&ref_name=${refName}&path=${path}`;
    const response = await fetch(new Request(
      url, {
        method: 'GET',
        headers: new Headers({
          'PRIVATE-TOKEN': getCurrentToken(),
        }),
      },
    ));
    return response.json();
  }

  static async getCommitDetails(projectId, commitId) {
    const url = `${API_GATEWAY}/api/v4/projects/${projectId}/repository/commits/${commitId}`;
    const response = await generateGetRequest(url);
    if(response.ok) {
      return response.json();
    } else {
      Promise.reject(response)
      toastr.error('Error: ', 'We could not retrieve commit details');
    }
  }

  static async getFileDataInCertainCommit(projectId, pathToFile, commitId) {
    const url = `${API_GATEWAY}/api/v4/projects/${projectId}/repository/files/${pathToFile}/raw?ref=${commitId}`;
    const response = await generateGetRequest(url);

    return response.arrayBuffer();
  }

  static async getCommitDiff(projectId, commitId) {
    const url = `${API_GATEWAY}/api/v4/projects/${projectId}/repository/commits/${commitId}/diff`;
    const response = await generateGetRequest(url);

    return response.json();
  }
}

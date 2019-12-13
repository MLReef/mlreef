import { SECURITY_TOKEN } from '../apiConfig';
import { domain } from '../dataTypes';
import { generateGetRequest } from './apiHelpers';

export default class CommitsApi {
  static async performCommit(projectId, filePath, fileContent, domain = 'gitlab.com', branch = 'master', commitMss, action) {
    try {
      const response = await fetch(
        `https://${domain}/api/v4/projects/${projectId}/repository/commits`, {
          method: 'POST',
          headers: new Headers({
            'PRIVATE-TOKEN': SECURITY_TOKEN,
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gitlab.com',
          }),
          body: JSON.stringify({
            branch,
            commit_message: commitMss,
            actions: [
              {
                action,
                file_path: filePath,
                content: fileContent,
              },
            ],
          }),
        },
      );

      return response.json();
    } catch (err) {
      return err;
    }
  }

  static async getCommits(projectId, refName = 'master', path = '', perPage = 20) {
    const url = `https://${domain}/api/v4/projects/${projectId}/repository/commits?per_page=${perPage}&ref_name=${refName}&path=${path}`;
    const response = await fetch(new Request(
      url, {
        method: 'GET',
        headers: new Headers({
          'PRIVATE-TOKEN': SECURITY_TOKEN,
        }),
      },
    ));
    return response.json();
  }

  static async getCommitDetails(projectId, commitId) {
    const url = `https://${domain}/api/v4/projects/${projectId}/repository/commits/${commitId}`;
    const response = await fetch(new Request(
      url, {
        method: 'GET',
        headers: new Headers({
          'PRIVATE-TOKEN': SECURITY_TOKEN,
        }),
      },
    ));
    return response.json();
  }

  static async getUsers(projectId) {
    const url = `https://${domain}/api/v4/projects/${projectId}/users`;
    const response = await fetch(new Request(
      url, {
        method: 'GET',
        headers: new Headers({
          'PRIVATE-TOKEN': SECURITY_TOKEN,
        }),
      },
    ));

    return response.json();
  }

  static async getFileDataInCertainCommit(projectId, pathToFile, commitId) {
    const url = `https://${domain}/api/v4/projects/${projectId}/repository/files/${pathToFile}/raw?ref=${commitId}`;
    const response = await generateGetRequest(url);

    return response.arrayBuffer();
  }

  static async getCommitDiff(projectId, commitId) {
    const url = `https://${domain}/api/v4/projects/${projectId}/repository/commits/${commitId}/diff`;
    const response = await generateGetRequest(url);

    return response.json();
  }

  static async submitMergeReq(id, sourceBranch, targetBranch, title, description = '') {
    const url = `https://${domain}/api/v4/projects/${id}/merge_requests`;
    try {
      const response = await fetch(
        url, {
          method: 'POST',
          headers: new Headers({
            'PRIVATE-TOKEN': SECURITY_TOKEN,
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://gitlab.com',
          }),
          body: JSON.stringify({
            id,
            source_branch: sourceBranch,
            target_branch: targetBranch,
            title,
            description,
          }),
        },
      );

      return response.json();
    } catch (err) {
      return err;
    }
  }
}

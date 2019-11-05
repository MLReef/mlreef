import { SECURITY_TOKEN } from '../apiConfig';
import { domain } from '../dataTypes';

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

  static async getCommits(projectId, refName = 'master', perPage = 20) {
    const url = `https://${domain}/api/v4/projects/${projectId}/repository/commits?per_page=${perPage}&ref_name=${refName}`;
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
}

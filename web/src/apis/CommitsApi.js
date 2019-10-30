import { SECURITY_TOKEN } from '../apiConfig';

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

  static async getCommits(domain, projectId) {
    const url = `https://${domain}/api/v4/projects/${projectId}/repository/commits`;
    return fetch(new Request(
      url, {
        method: 'GET',
        headers: new Headers({
          'PRIVATE-TOKEN': SECURITY_TOKEN,
        }),
      },
    ));
  }

  static getCommitDetails(domain, projectId, commitId) {
    const url = `https://${domain}/api/v4/projects/${projectId}/repository/commits/${commitId}`;
    return fetch(new Request(
      url, {
        method: 'GET',
        headers: new Headers({
          'PRIVATE-TOKEN': SECURITY_TOKEN,
        }),
      },
    ));
  }

  static async getUsers(domain, projectId) {
    const url = `https://${domain}/api/v4/projects/${projectId}/users`;
    return fetch(new Request(
      url, {
        method: 'GET',
        headers: new Headers({
          'PRIVATE-TOKEN': SECURITY_TOKEN,
        }),
      },
    ));
  }
}

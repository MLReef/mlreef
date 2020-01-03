import { SECURITY_TOKEN, GITLAB_INSTANCE } from '../apiConfig';

export default class FilesApi {
  static async getFilesPerProject(projectId, path, recursive = false, branch = 'master') {
    try {
      const response = await fetch(new Request(`${GITLAB_INSTANCE}/api/v4/projects/${projectId}/repository/`
                + `tree?ref=${branch}&recursive=${recursive}&path=${path}&per_page=50`, {
        method: 'GET',
        headers: new Headers({
          'PRIVATE-TOKEN': SECURITY_TOKEN,
        }),
      }));
      return response.json();
    } catch (err) {
      return err;
    }
  }

  static async getFileData(projectId = '12395599', path = '/', branch = 'master') {
    try {
      const url = `${GITLAB_INSTANCE}/api/v4/projects/${projectId}/repository/files/${path}?ref=${branch}`;
      const response = await fetch(new Request(url, {
        method: 'GET',
        headers: new Headers({
          'PRIVATE-TOKEN': SECURITY_TOKEN,
        }),
      }));
      return response.json();
    } catch (err) {
      return err;
    }
  }
}

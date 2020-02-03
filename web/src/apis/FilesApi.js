import { GITLAB_INSTANCE } from '../apiConfig';
import { getCurrentToken } from './apiHelpers';

export default class FilesApi {
  static async getFilesPerProject(projectId, path, recursive = false, branch = 'master') {
    try {
      const response = await fetch(new Request(`${GITLAB_INSTANCE}/api/v4/projects/${projectId}/repository/`
                + `tree?ref=${branch}&recursive=${recursive}&path=${path}&per_page=50`, {
        method: 'GET',
        headers: new Headers({
          'PRIVATE-TOKEN': getCurrentToken(),
        }),
      }));
      return response.json();
    } catch (err) {
      window.history.replaceState({ errorCode: 500 }, 'Mlreef', '/error-page');
      window.location.reload();
    }
  }

  static async getFileData(projectId = '12395599', path = '/', branch = 'master') {
    try {
      const url = `${GITLAB_INSTANCE}/api/v4/projects/${projectId}/repository/files/${path}?ref=${branch}`;
      const response = await fetch(new Request(url, {
        method: 'GET',
        headers: new Headers({
          'PRIVATE-TOKEN': getCurrentToken(),
        }),
      }));
      return response.json();
    } catch (err) {
      return err;
    }
  }
}

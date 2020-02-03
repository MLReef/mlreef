import { GITLAB_INSTANCE } from '../apiConfig';
import { getCurrentToken } from './apiHelpers';

export default class PipeLinesApi {
  static async create(projectId, refBranch) {
    try {
      const response = await fetch(
        `${GITLAB_INSTANCE}/api/v4/projects/${projectId}/pipeline?ref=${refBranch}`, {
          method: 'POST',
          headers: new Headers({
            'PRIVATE-TOKEN': getCurrentToken(),
            'Content-Type': 'application/json',
          }),
        },
      );
      return response.json();
    } catch (err) {
      return err;
    }
  }

  static async getPipesByProjectId(projectId) {
    try {
      const response = await fetch(
        `${GITLAB_INSTANCE}/api/v4/projects/${projectId}/pipelines/`, {
          method: 'GET',
          headers: new Headers({
            'PRIVATE-TOKEN': getCurrentToken(),
          }),
        },
      );
      return response.json();
    } catch (err) {
      return err;
    }
  }
}

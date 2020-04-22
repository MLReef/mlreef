import { API_GATEWAY } from '../apiConfig';
import { getCurrentToken } from './apiHelpers';

export default class PipeLinesApi {
  static async create(projectId, refBranch, payload) {
    const body = JSON.stringify(payload);
    try {
      const response = await fetch(
        `${API_GATEWAY}/api/v4/projects/${projectId}/pipeline?ref=${refBranch}`, {
          method: 'POST',
          headers: new Headers({
            'PRIVATE-TOKEN': getCurrentToken(),
            'Content-Type': 'application/json',
          }),
          body,
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
        `${API_GATEWAY}/api/v4/projects/${projectId}/pipelines/`, {
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

import { API_GATEWAY, GITLAB_PORT } from '../apiConfig';
import { getCurrentToken } from './apiHelpers';

export default class ContributorsApi {
  static async getProjectContributors(projectId) {
    try {
      const response = await fetch(new Request(`${API_GATEWAY}:${GITLAB_PORT}/api/v4/projects/${projectId}/members`, {
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

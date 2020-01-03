import { SECURITY_TOKEN, GITLAB_INSTANCE } from '../apiConfig';

export default class ContributorsApi {
  static async getProjectContributors(projectId) {
    try {
      const response = await fetch(new Request(`${GITLAB_INSTANCE}/api/v4/projects/${projectId}/members`, {
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

import { SECURITY_TOKEN } from '../apiConfig';
import { domain } from '../dataTypes';


export default class ProjectGeneralInfoApi {
  static async getProjectsList() {
    try {
      const response = await fetch(new Request(`https://${domain}/api/v4/projects?simple=true&membership=true`, {
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

  /**
   * @param {*} id: project which will be forked
   * @param {*} namespace: space to fork project to
   * @param {*} name: forked project name
   */
  static async forkProject(id, namespace, name) {
    const url = `https://${domain}/api/v4/projects/${id}/fork`;
    return fetch(new Request(
      url, {
        method: 'POST',
        headers: new Headers({
          'PRIVATE-TOKEN': SECURITY_TOKEN,
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          id, namespace, name,
        }),
      },
    ));
  }

  static async removeProject(projectId) {
    const url = `https://${domain}/api/v4/projects/${projectId}`;
    return fetch(new Request(
      url, {
        method: 'DELETE',
        headers: new Headers({
          'PRIVATE-TOKEN': SECURITY_TOKEN,
        }),
      },
    ));
  }
}

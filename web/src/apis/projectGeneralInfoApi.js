import { SECURITY_TOKEN, GITLAB_INSTANCE } from '../apiConfig';

export default class ProjectGeneralInfoApi {

  static async create(projectName, readme, description) {
    let baseUrl = `${GITLAB_INSTANCE}/api/v4/projects?name=${projectName}`;
    if(description){
      baseUrl = `${baseUrl}&description=${description}`
    }
    if(readme){
      baseUrl = `${baseUrl}&initialize_with_readme=${readme}`
    }
    try {
      const response = await fetch(
        baseUrl, {
          method: 'POST',
          headers: new Headers({
            'PRIVATE-TOKEN': SECURITY_TOKEN,
            'Content-Type': 'application/json',
          }),
        },
      );
      return response
    } catch (err) {
      return err;
    }
  }

  static async getProjectInfoApi(projectId) {
    try {
      const respone = await fetch(new Request(`${GITLAB_INSTANCE}/api/v4/projects/${projectId}`, {
        method: 'GET',
        headers: new Headers({
          'PRIVATE-TOKEN': SECURITY_TOKEN,
        }),
      }));
      return respone.json();
    } catch (err) {
      return err;
    }
  }

  static async getProjectsList() {
    try {
      const response = await fetch(new Request(`${GITLAB_INSTANCE}/api/v4/projects?simple=true&membership=true`, {
        method: 'GET',
        headers: new Headers({
          'PRIVATE-TOKEN': SECURITY_TOKEN,
        }),
      }));
      
      return response.json();
    } catch (err) {
      window.history.replaceState({ errorCode: 500 }, "Mlreef", '/error-page');
      window.location.reload();
    }
  }

  /**
   * @param {*} id: project which will be forked
   * @param {*} namespace: space to fork project to
   * @param {*} name: forked project name
   */
  static async forkProject(id, namespace, name) {
    const url = `${GITLAB_INSTANCE}/api/v4/projects/${id}/fork`;
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
    const url = `${GITLAB_INSTANCE}/api/v4/projects/${projectId}`;
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

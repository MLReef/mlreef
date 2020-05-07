import { API_GATEWAY } from '../apiConfig';
import { getCurrentToken, generateGetRequest } from './apiHelpers';
import { toastr } from 'react-redux-toastr';

export default class ProjectGeneralInfoApi {
  static async create(settings) {
    const baseUrl = new URL(`${API_GATEWAY}/api/v1/data-projects`);
    const data = {...settings};
    try {
      const response = await fetch(
        baseUrl, {
          method: 'POST',
          headers: new Headers({
            'PRIVATE-TOKEN': getCurrentToken(),
            "Accept": 'application/json',
            'Content-Type': 'application/json',
            Origin: 'http://localhost',
          }),
          body: JSON.stringify(data),
        },
      );
      return response;
    } catch (err) {
      return err;
    }
  }

  static async getProjectInfoApi(projectId) {
    try {
      const respone = await fetch(new Request(`${API_GATEWAY}/api/v4/projects/${projectId}`, {
        method: 'GET',
        headers: new Headers({
          'PRIVATE-TOKEN': getCurrentToken(),
        }),
      }));
      if (!respone.ok) {
        throw new Error();
      }
      return respone.json();
    } catch (err) {
      window.history.replaceState({ errorCode: 500 }, 'Mlreef', '/error-page');
      window.location.reload();
    }
  }

  static async getProjectsList() {
    const url = new URL(`${API_GATEWAY}/api/v1/data-projects`);
    const respone = generateGetRequest(url.href);

    return respone
      .then((res) => res.json())
      .then((projects) => Array.isArray(projects) ? projects : Promise.reject(projects));
  }

  /**
   * @param {*} id: project which will be forked
   * @param {*} namespace: space to fork project to
   * @param {*} name: forked project name
   */
  static async forkProject(id, namespace, name) {
    const url = `${API_GATEWAY}/api/v4/projects/${id}/fork`;
    return fetch(new Request(
      url, {
        method: 'POST',
        headers: new Headers({
          'PRIVATE-TOKEN': getCurrentToken(),
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          id, namespace, name,
        }),
      },
    ));
  }

  static async removeProject(projectId) {
    const url = `${API_GATEWAY}/api/v4/projects/${projectId}`;
    return fetch(new Request(
      url, {
        method: 'DELETE',
        headers: new Headers({
          'PRIVATE-TOKEN': getCurrentToken(),
        }),
      },
    ));
  }

  static async getRepositoryBlob(projectId) {
    const url = `/projects/${projectId}/repository/blobs/master`;
    const request = await generateGetRequest(url);

    return request;
  }

  static async getProjectContributors(projectId) {
    try {
      const url = `${API_GATEWAY}/api/v4/projects/${projectId}/members`;
      const response = await generateGetRequest(url);
      return response;
    } catch (err) {
      return err;
    }
  }

  static async getUsers(projectId) {
    const url = `${API_GATEWAY}/api/v4/projects/${projectId}/users`;
    const response = generateGetRequest(url);
    return response
      .then((projRes) => projRes.ok ? Promise.resolve(projRes) : Promise.reject(projRes))
      .then((resolvedRes) => resolvedRes.json())
      .catch(() => toastr.error("Error", "Something went wrong getting ussers"));
  }
}

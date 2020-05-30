import { toastr } from 'react-redux-toastr';
import { getCurrentToken, generateGetRequest } from './apiHelpers';

export default class ProjectGeneralInfoApi {
  static async create(settings) {
    const response = await fetch(
      '/api/v1/data-projects', {
        method: 'POST',
        headers: new Headers({
          'PRIVATE-TOKEN': getCurrentToken(),
          Accept: 'application/json',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ ...settings }),
      },
    );
    if (!response.ok) {
      Promise.reject(response);
      toastr.error('Error', 'Server error while creating the project');
    }
    return response;
  }

  static async getProjectInfoApi(projectId) {
    const url = `/api/v4/projects/${projectId}`;
    const respone = await generateGetRequest(url);
    if (!respone.ok) {
      window.history.replaceState({ errorCode: 500 }, 'Mlreef', '/error-page');
      window.location.reload();
    }
    return respone.json();
  }

  static async getProjectsList() {
    return generateGetRequest('/api/v1/data-projects')
      .then((res) => res.json())
      .then((projects) => Array.isArray(projects) ? projects : Promise.reject(projects));
  }

  /**
   * @param {*} id: project which will be forked
   * @param {*} namespace: space to fork project to
   * @param {*} name: forked project name
   */
  static async forkProject(id, namespace, name) {
    const url = `/api/v4/projects/${id}/fork`;
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
    const url = `/api/v4/projects/${projectId}`;
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
    const url = `/api/v4/projects/${projectId}/members`;
    const response = await generateGetRequest(url);

    if (!response.ok) {
      Promise.reject(response);
      toastr.error('Error', 'Something went wrong fetching the contributors');
    }
    return response;
  }

  static async getUsers(projectId) {
    const url = `/api/v4/projects/${projectId}/users`;
    const response = await generateGetRequest(url);
    if (!response.ok) {
      Promise.reject(response);
      toastr.error('Error', 'Something went wrong fetching users');
    }
    return response.json();
  }
}

import { API_GATEWAY, BUILD_TIMEOUT, GITLAB_PORT } from '../apiConfig';
import { getCurrentToken, generateGetRequest } from './apiHelpers';

const defaultProjectSettings = {
  ci_config_path: '.mlreef.yml',
  build_timeout: BUILD_TIMEOUT,
};

export default class ProjectGeneralInfoApi {
  static async create(settings) {
    const baseUrl = new URL(`${API_GATEWAY}:${GITLAB_PORT}/api/v4/projects`);
    const params = {
      ...defaultProjectSettings,
      ...settings,
    };
    Object.entries(params)
      .forEach((param) => baseUrl.searchParams.append(...param));
    try {
      const response = await fetch(
        baseUrl, {
          method: 'POST',
          headers: new Headers({
            'PRIVATE-TOKEN': getCurrentToken(),
            'Content-Type': 'application/json',
          }),
        },
      );
      return response;
    } catch (err) {
      return err;
    }
  }

  static async getProjectInfoApi(projectId) {
    try {
      const respone = await fetch(new Request(`${API_GATEWAY}:${GITLAB_PORT}/api/v4/projects/${projectId}`, {
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

  static async getProjectsList(params = {}) {
    const url = new URL(`${API_GATEWAY}:${GITLAB_PORT}/api/v4/projects`);
    // set query params
    Object.entries({ simple: true, ...params })
      .forEach((param) => url.searchParams.append(...param));
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
    const url = `${API_GATEWAY}:${GITLAB_PORT}/api/v4/projects/${id}/fork`;
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
    const url = `${API_GATEWAY}:${GITLAB_PORT}/api/v4/projects/${projectId}`;
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
      const url = `${API_GATEWAY}:${GITLAB_PORT}/api/v4/projects/${projectId}/members`;
      const response = await generateGetRequest(url);
      return response;
    } catch (err) {
      return err;
    }
  }
}

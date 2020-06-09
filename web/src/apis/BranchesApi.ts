import 'core-js/stable';
import 'regenerator-runtime/runtime';
import ApiDirector from './ApiDirector';
import BodyLessApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import { METHODS } from './apiBuilders/requestMethodsEnum';

export default class BranchesApi extends ApiDirector {
  async create(projectId: number, branchName: string, refBranch: string) {
    const url = `/api/v4/projects/${projectId}/repository/branches`;
    const BLbuilder = new BodyLessApiRequestCallBuilder(METHODS.POST, this.buildBasicHeaders(), url);
    const params = new Map();
    params.set('branch', branchName);
    params.set('ref', refBranch);
    BLbuilder.setUrlParams(params);
    BLbuilder.buildUrlWithParams();
    const response = await fetch(
      BLbuilder.build()
    );
    return response.ok ? response.json() : Promise.reject(response);
  }

  async getBranches(projectId: number) {
    const url = `/api/v4/projects/${projectId}/repository/branches`;
    const BLbuilder = new BodyLessApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(), url);
    const response = await fetch(BLbuilder.build())

    if (!response.ok) {
      Promise.reject(response);
    }
    return response.json();
  }

  async compare(projectId: number, from: string, to: string) {
    const url = `/api/v4/projects/${projectId}/repository/compare?from=${from}&to=${to}`;
    const BLbuilder = new BodyLessApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(), url);
    const response = await fetch(BLbuilder.build());

    if (!response.ok) {
      Promise.reject(response);
    }
    return response.json();
  }

  async delete(projectId: number, branch: string) {
    const branchName = encodeURIComponent(branch);
    const url = `/api/v4/projects/${projectId}/repository/branches/${branchName}`;
    const BLbuilder = new BodyLessApiRequestCallBuilder(METHODS.DELETE, this.buildBasicHeaders(), url);

    return fetch(BLbuilder.build())
      .then((res) => res.ok ? res : Promise.reject(res));
  }
}

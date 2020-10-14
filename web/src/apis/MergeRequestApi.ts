import { handleResponse } from 'functions/helpers';
import ApiDirector from './ApiDirector';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';
import BLApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import ApiRequestCallBuilder from './apiBuilders/ApiRequestCallBuilder';

export default class MergeRequestAPI extends ApiDirector {
  /**
   * @param {projectId} is the id the project to get MR's to
   */
  getListByProject(projectId: number) {
    const url = `/api/v4/projects/${projectId}/merge_requests`;
    const headers = this.buildBasicHeaders(validServicesToCall.GITLAB);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  updateMergeRequest(gid: number, iid: number, payload: any) {
    const url = `/api/v4/projects/${gid}/merge_requests/${iid}`;
    const headers = this.buildBasicHeaders(validServicesToCall.GITLAB);
    const body = JSON.stringify(payload);
    const builder = new ApiRequestCallBuilder(METHODS.PUT, headers, url, body);

    return fetch(builder.build())
      .then(handleResponse);
  }

  getSingleMR(id: number, iid: number) {
    const url = `/api/v4/projects/${id}/merge_requests/${iid}`;
    const headers = this.buildBasicHeaders(validServicesToCall.GITLAB);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  async submitMergeReq(id: number, sourceBranch: string, targetBranch: string, title: string, description = '') {
    const body = JSON.stringify({
      id,
      source_branch: sourceBranch,
      target_branch: targetBranch,
      title,
      description,
    });
    const url = `/api/v4/projects/${id}/merge_requests`;
    const builder = new ApiRequestCallBuilder(METHODS.POST, this.buildBasicHeaders(validServicesToCall.GITLAB), url, body)
    return fetch(builder.build())
      .then(handleResponse)
  }

  acceptMergeRequest(id: number, iid: number, squash: boolean, removeSourceBranch: string) {
    let baseUrl = `/api/v4/projects/${id}/merge_requests/${iid}/merge?squash=${squash}`;

    if (removeSourceBranch) {
      baseUrl = `${baseUrl}&should_remove_source_branch=${removeSourceBranch}`;
    }

    const builder = new BLApiRequestCallBuilder(METHODS.PUT, this.buildBasicHeaders(validServicesToCall.GITLAB), baseUrl);
    return fetch(builder.build())
      .then(handleResponse)
  }
}

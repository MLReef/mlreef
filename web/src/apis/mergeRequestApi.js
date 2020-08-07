import { toastr } from 'react-redux-toastr';
import { handleResponse } from 'functions/apiCalls';
import ApiDirector from './ApiDirector';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';
import BLApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import ApiRequestCallBuilder from './apiBuilders/ApiRequestCallBuilder';
import { generateGetRequest, getCurrentToken } from './apiHelpers';

export class MergeRequestAPI extends ApiDirector {
  /**
   * @param {projectId} is the id the project to get MR's to
   */
  getListByProject(projectId) {
    const url = `/api/v4/projects/${projectId}/merge_requests`;
    const headers = this.buildBasicHeaders(validServicesToCall.GITLAB);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  updateMergeRequest(gid, iid, payload) {
    const url = `/api/v4/projects/${gid}/merge_requests/${iid}`;
    const headers = this.buildBasicHeaders(validServicesToCall.GITLAB);
    const body = JSON.stringify(payload);
    const builder = new ApiRequestCallBuilder(METHODS.PUT, headers, url, body);

    return fetch(builder.build())
      .then(handleResponse);
  }

  static async getSingleMR(id, iid) {
    const url = `/api/v4/projects/${id}/merge_requests/${iid}`;

    const response = await generateGetRequest(url);
    if (!response.ok) {
      Promise.reject(response);
      toastr.error('Error', 'Server error while fetching the merge request');
    }
    return response.json();
  }

  static async submitMergeReq(id, sourceBranch, targetBranch, title, description = '') {
    const body = JSON.stringify({
      id,
      source_branch: sourceBranch,
      target_branch: targetBranch,
      title,
      description,
    });
    const url = `/api/v4/projects/${id}/merge_requests`;
    const response = await fetch(
      url, {
        method: 'POST',
        headers: new Headers({
          authorization: getCurrentToken(),
          'Content-Type': 'application/json',
        }),
        body,
      },
    );
    if (!response.ok) {
      Promise.reject(response);
      toastr.error('Error', response.err);
    }
    return response.json();

  }

  static async acceptMergeRequest(id, iid, squash, removeSourceBranch) {
    let baseUrl = `/api/v4/projects/${id}/merge_requests/${iid}/merge?squash=${squash}`;

    if (removeSourceBranch) {
      baseUrl = `${baseUrl}&should_remove_source_branch=${removeSourceBranch}`;
    }

    const response = await fetch(new Request(
      baseUrl, {
        method: 'PUT',
        headers: new Headers({
          authorization: getCurrentToken(),
          'Content-Type': 'application/json'
        }),
      },
    ));
    if (!response.ok) {
      return Promise.reject(await response.json());
    }
    return response.json();
  }
}

export default MergeRequestAPI;

import { toastr } from 'react-redux-toastr';
import { API_GATEWAY } from '../apiConfig';
import { generateGetRequest, getCurrentToken } from './apiHelpers';

export default class MergeRequestAPI {
  /**
   * @param {projectId} is the id the project to get MR's to
   */
  static async getListByProject(projectId) {
    const url = `${API_GATEWAY}/api/v4/projects/${projectId}/merge_requests`;
    const response = await generateGetRequest(url);

    if (!response.ok) {
      Promise.reject(response);
      toastr.error('Error', 'Server error while fetching merge requests');
    }
    return response.json();
  }

  static async getSingleMR(id, iid) {
    const url = `${API_GATEWAY}/api/v4/projects/${id}/merge_requests/${iid}`;

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
    const url = `${API_GATEWAY}/api/v4/projects/${id}/merge_requests`;
    const response = await fetch(
      url, {
        method: 'POST',
        headers: new Headers({
          'PRIVATE-TOKEN': getCurrentToken(),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': `${API_GATEWAY}`,
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
    let baseUrl = `${API_GATEWAY}/api/v4/projects/${id}/merge_requests/${iid}/merge?squash=${squash}`;

    if (removeSourceBranch) {
      baseUrl = `${baseUrl}&should_remove_source_branch=${removeSourceBranch}`;
    }

    const response = await fetch(new Request(
      baseUrl, {
        method: 'PUT',
        headers: new Headers({
          'PRIVATE-TOKEN': getCurrentToken(),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': `${API_GATEWAY}`,
        }),
      },
    ));
    if (!response.ok) {
      Promise.reject(response);
      toastr.error('Error', 'Server error while updating the merge request');
    }
    return response.json();
  }
}

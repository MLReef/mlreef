import { API_GATEWAY } from '../apiConfig';
import { generateGetRequest, getCurrentToken } from './apiHelpers';
import { toastr } from 'react-redux-toastr';

export default class MergeRequestAPI {
  /**
   * @param {projectId} is the id the project to get MR's to
   */
  static async getListByProject(projectId) {
    const url = `${API_GATEWAY}/api/v4/projects/${projectId}/merge_requests`;
    const jobsProm = await generateGetRequest(url);

    return jobsProm.json();
  }

  static async getSingleMR(id, iid) {
    const url = `${API_GATEWAY}/api/v4/projects/${id}/merge_requests/${iid}`;

    const response = await fetch(new Request(
      url, {
        method: 'GET',
        headers: new Headers({
          'PRIVATE-TOKEN': getCurrentToken(),
        }),
      },
    ));
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
    console.log(body);
    const url = `${API_GATEWAY}/api/v4/projects/${id}/merge_requests`;
    try {
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
      console.log(response);
      return response.ok ? response.json() 
        : Promise.reject(response);
    } catch (err) {
      return toastr.error("Error", err.message);
    }
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
    return response.json();
  }

}

import { API_GATEWAY, GITLAB_PORT } from '../apiConfig';
import { generateGetRequest, getCurrentToken } from './apiHelpers';

export default class MergeRequestAPI {
  /**
   * @param {projectId} is the id the project to get MR's to
   */
  static async getListByProject(projectId) {
    const url = `${API_GATEWAY}:${GITLAB_PORT}/api/v4/projects/${projectId}/merge_requests`;
    const jobsProm = await generateGetRequest(url);

    return jobsProm.json();
  }

  static async getSingleMR(id, iid) {
    const url = `${API_GATEWAY}:${GITLAB_PORT}/api/v4/projects/${id}/merge_requests/${iid}`;

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
    const url = `${API_GATEWAY}:${GITLAB_PORT}/api/v4/projects/${id}/merge_requests`;
    try {
      const response = await fetch(
        url, {
          method: 'POST',
          headers: new Headers({
            'PRIVATE-TOKEN': getCurrentToken(),
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': `${API_GATEWAY}:${GITLAB_PORT}`,
          }),
          body: JSON.stringify({
            id,
            source_branch: sourceBranch,
            target_branch: targetBranch,
            title,
            description,
          }),
        },
      );

      return response.json();
    } catch (err) {
      return err;
    }
  }

  static async acceptMergeRequest(id, iid, squash, removeSourceBranch) {
    let baseUrl = `${API_GATEWAY}:${GITLAB_PORT}/api/v4/projects/${id}/merge_requests/${iid}/merge?squash=${squash}`;

    if (removeSourceBranch) {
      baseUrl = `${baseUrl}&should_remove_source_branch=${removeSourceBranch}`;
    }

    const response = await fetch(new Request(
      baseUrl, {
        method: 'PUT',
        headers: new Headers({
          'PRIVATE-TOKEN': getCurrentToken(),
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': `${API_GATEWAY}:${GITLAB_PORT}`,
        }),
      },
    ));
    return response.json();
  }

}

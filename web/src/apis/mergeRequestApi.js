import { SECURITY_TOKEN, GITLAB_INSTANCE } from '../apiConfig';
import { generateGetRequest } from './apiHelpers';

export default class MergeRequestAPI {

  /**
   * @param {projectId} is the id the project to get MR's to
   */
  static async getListByProject(projectId){
    const url = `${GITLAB_INSTANCE}/api/v4/projects/${projectId}/merge_requests`;
    const jobsProm = await generateGetRequest(url);

    return jobsProm.json();
  }

  static async submitMergeReq(id, sourceBranch, targetBranch, title, description = '') {
      const url = `${GITLAB_INSTANCE}/api/v4/projects/${id}/merge_requests`;
      try {
        const response = await fetch(
          url, {
            method: 'POST',
            headers: new Headers({
              'PRIVATE-TOKEN': SECURITY_TOKEN,
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'https://gitlab.com',
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
}
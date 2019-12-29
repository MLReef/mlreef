import { SECURITY_TOKEN } from '../apiConfig';
import { generateGetRequest } from './apiHelpers';
import { domain } from '../dataTypes';

/**
 * core-js and regenerator-runtime imports are necessary to make tests run
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

export default class BranchesApi {
  static async create(projectId, branchName, refBranch) {
    try {
      const response = await fetch(
        `https://${domain}/api/v4/projects/${projectId}/repository/branches?branch=${branchName}&ref=${refBranch}`, {
          method: 'POST',
          headers: new Headers({
            'PRIVATE-TOKEN': SECURITY_TOKEN,
            'Content-Type': 'application/json',
          }),
        },
      );
      return response.json();
    } catch (err) {
      return err;
    }
  }

  static async getBranches(projectId) {
    const url = `https://${domain}/api/v4/projects/${projectId}/repository/branches`;
    const response = await generateGetRequest(url);

    return response.json();
  }

  static async compare(projectId, from, to) {
    const url = `https://${domain}/api/v4/projects/${projectId}/repository/compare?from=${from}&to=${to}`;
    const response = await generateGetRequest(url);

    return response.json();
  }

  static async delete(projectId, branchName) {
    const url = `https://${domain}/api/v4/projects/${projectId}/repository/branches/${branchName}`;
    try {
      const response = await fetch(
        url, {
          method: 'DELETE',
          headers: new Headers({
            'PRIVATE-TOKEN': SECURITY_TOKEN,
          }),
        },
      );
      return response.status;
    } catch (err) {
      return err;
    }
  }
}

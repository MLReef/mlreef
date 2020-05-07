import { toastr } from 'react-redux-toastr';
import { API_GATEWAY } from '../apiConfig';
import { getCurrentToken, generateGetRequest } from './apiHelpers';

export default class PipeLinesApi {
  static async create(projectId, refBranch, payload) {
    const body = JSON.stringify(payload);
    try {
      const response = await fetch(
        `${API_GATEWAY}/api/v4/projects/${projectId}/pipeline?ref=${refBranch}`, {
          method: 'POST',
          headers: new Headers({
            'PRIVATE-TOKEN': getCurrentToken(),
            'Content-Type': 'application/json',
          }),
          body,
        },
      );
      return response.json();
    } catch (err) {
      return err;
    }
  }

  static async getPipesByProjectId(projectId) {
    try {
      const response = await fetch(
        `${API_GATEWAY}/api/v4/projects/${projectId}/pipelines/`, {
          method: 'GET',
          headers: new Headers({
            'PRIVATE-TOKEN': getCurrentToken(),
          }),
        },
      );
      return response.json();
    } catch (err) {
      return err;
    }
  }

  static async getPipesById(projectId, pipeId) {
    try {
      const url = `${API_GATEWAY}/api/v4/projects/${projectId}/pipelines/${pipeId}`;
      const response = await generateGetRequest(url);
      if (response.ok) {
        return response.json();
      }
      return toastr.error('Error', 'Server error');
    } catch (err) {
      return err;
    }
  }
}

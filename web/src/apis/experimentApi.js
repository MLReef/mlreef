import { toastr } from 'react-redux-toastr';
import { API_GATEWAY } from '../apiConfig';
import { getCurrentToken, generateGetRequest } from './apiHelpers';

export default class ExperimentsApi {
  static buildPostHeaders() {
    return new Headers({
      'PRIVATE-TOKEN': getCurrentToken(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Origin: 'http://localhost',
    });
  }

  static async createExperiment(projectUUId, body) {
    const response = await fetch(
      `${API_GATEWAY}/api/v1/data-projects/${projectUUId}/experiments`, {
        method: 'POST',
        headers: this.buildPostHeaders(),
        body: JSON.stringify(body),
      },
    );
    if (!response.ok) {
      Promise.reject(response);
      toastr.error('Error', 'Server error while creating the experiment');
    }
    return response.json();
  }

  static async startExperiment(dataProjectId, experimentId) {
    const response = await fetch(
      `${API_GATEWAY}/api/v1/data-projects/${dataProjectId}/experiments/${experimentId}/start`, {
        method: 'POST',
        headers: this.buildPostHeaders(),
      },
    );
    if (!response.ok) {
      Promise.reject(response);
      toastr.error('Error', 'Server error while starting the experiment');
    }
    return response;
  }

  static async getExperimentDetails(projectUUID, experimentID) {
    const url = `${API_GATEWAY}/api/v1/data-projects/${projectUUID}/experiments/${experimentID}`;
    const response = await generateGetRequest(url);
    if (!response.ok) {
      Promise.reject(response);
      toastr.error('Error', 'Server error while fetching the experiment details');
    }
    return response.json();
  }

  static async getExperiments(projectUUID) {
    const url = `${API_GATEWAY}/api/v1/data-projects/${projectUUID}/experiments`;
    const response = await generateGetRequest(url);
    if (!response.ok) {
      Promise.reject(response);
    }
    return response.json();
  }
}

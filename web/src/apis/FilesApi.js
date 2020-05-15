import { toastr } from 'react-redux-toastr';
import { API_GATEWAY } from '../apiConfig';
import { generateGetRequest } from './apiHelpers';

export default class FilesApi {
  static async getFilesPerProject(projectId, path, recursive = false, branch = 'master') {
    const url = `${API_GATEWAY}/api/v4/projects/${projectId}/repository/`
    + `tree?ref=${branch}&recursive=${recursive}&path=${path}&per_page=50`;
    const response = await generateGetRequest(url);
    if (!response.ok) {
      Promise.reject(response);
      toastr.error('Error', 'Could not fetch the project files');
    }
    return response;
  }

  static async getFileData(projectId = '12395599', path = '/', branch = 'master') {
    const url = `${API_GATEWAY}/api/v4/projects/${projectId}/repository/files/${path}?ref=${branch}`;
    const response = await generateGetRequest(url);
    if (!response.ok) {
      Promise.reject(response);
      toastr.error('Error', 'Server error while creating the experiment');
    }
    return response.json();
  }
}

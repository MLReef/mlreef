import { generateGetRequest } from './apiHelpers';
import { toastr } from 'react-redux-toastr';
import { API_GATEWAY } from '../apiConfig';

export default class JobsApi {
  static async getPerProject(projectId) {
    const url = `${API_GATEWAY}/api/v4/projects/${projectId}/jobs`;
    const jobsProm = await generateGetRequest(url);

    return jobsProm.json();
  }

  static async getJobById(projectId, jobId) {
    const url = `${API_GATEWAY}/api/v4/projects/${projectId}/jobs/${jobId}`;
    const jobsProm = await generateGetRequest(url);

    if (!jobsProm.ok) {
      toastr.error('Error', 'Something is bad with server');
    } else{
      return jobsProm.json();
    }
  }

  static async downloadArtifacts(projectId, refName, jobName) {
    const url = `${API_GATEWAY}/api/v4/projects/${projectId}/jobs/artifacts/${refName}/download?job=${jobName}`;
    const jobsProm = await generateGetRequest(url);

    return jobsProm;
  }

  static async getLog(projectId, jobId) {
    const url = `${API_GATEWAY}/api/v4/projects/${projectId}/jobs/${jobId}/trace`;
    const jobsProm = await generateGetRequest(url);

    return jobsProm;
  }
}

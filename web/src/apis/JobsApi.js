import { generateGetRequest } from './apiHelpers';
import { domain } from '../dataTypes';

export default class JobsApi {
  static async getPerProject(projectId) {
    const url = `https://${domain}/api/v4/projects/${projectId}/jobs/`;
    const jobsProm = await generateGetRequest(url);

    return jobsProm.json();
  }

  static async getArtifacts(projectId, jobId) {
    const url = `https://${domain}/api/v4/projects/${projectId}/jobs/${jobId}/artifacts`;
    const jobsProm = await generateGetRequest(url);

    return jobsProm.json();
  }

  static async getLog(projectId, jobId) {
    const url = `https://${domain}/api/v4/projects/${projectId}/jobs/${jobId}/trace`;
    const jobsProm = await generateGetRequest(url);

    return jobsProm;
  }
}

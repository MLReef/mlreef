import fetch from 'node-fetch';
import { EXTERNAL_ROOT_URL } from '../../apiConfig';

//
// This is a spike implementation.
// This code exists only to show a possible architecture of the end2end tests
// As with all spikes it is an experiment / investigation which
// can -and probably should- be deleted once a final solution is found
//
export default class CodeProjectPublishingApi {
  publish(headers: any, projectId: any, body: any) {
    const baseUrl = `${EXTERNAL_ROOT_URL}/api/v1/code-projects/${projectId}/publish`;
    return fetch(baseUrl, { method: 'POST', headers, body });
  }
}

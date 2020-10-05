import { EXTERNAL_ROOT_URL } from 'apiConfig';
import ApiDirector from 'apis/ApiDirector';
import fetch from 'node-fetch';

//
// This is a spike implementation.
// This code exists only to show a possible architecture of the end2end tests
// As with all spikes it is an experiment / investigation which
// can -and probably should- be deleted once a final solution is found
//
export default class ProjectApiMockSpike extends ApiDirector {
  get(headers: any, id: string) {
    const baseUrl = `${EXTERNAL_ROOT_URL}/api/v1/code-projects`;
    return fetch(baseUrl, { method: 'GET', headers});
  }

  create(headers: any, body: any) {
    const baseUrl = `${EXTERNAL_ROOT_URL}/api/v1/code-projects`;
    return fetch(baseUrl, { method: 'POST', headers, body });
  }

  delete(headers: any, id: string) {
    const baseUrl = `${EXTERNAL_ROOT_URL}/api/v1/code-projects/${id}`;
    return fetch(baseUrl, { method: 'DELETE', headers });
  }
}

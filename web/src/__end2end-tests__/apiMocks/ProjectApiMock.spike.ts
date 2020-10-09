import { EXTERNAL_ROOT_URL } from 'apiConfig';
import ApiDirector from 'apis/ApiDirector';

// node fetch works
// import fetch from 'node-fetch';

// all other versions do not yet work
// import fetch from 'unfetch';
// import fetch from 'isomorphic-unfetch';
// import 'isomorphic-unfetch';
// import 'whatwg-fetch';

// require('isomorphic-fetch');
// require('whatwg-fetch');

//
// This is a spike implementation.
// This code exists only to show a possible architecture of the end2end tests
// As with all spikes it is an experiment / investigation which
// can -and probably should- be deleted once a final solution is found
//
export default class ProjectApiMockSpike extends ApiDirector {
  getPublicProjects(headers: any) {
    const baseUrl = `/api/v1/projects/public`;
    return fetch(baseUrl, { method: 'GET', headers });
  }

  get(headers: any, id: string) {
    const baseUrl = `/api/v1/code-projects/${id}`;
    return fetch(baseUrl, { method: 'GET', headers });
  }

  create(headers: any, body: any) {
    const baseUrl = '/api/v1/code-projects';
    return fetch(baseUrl, { method: 'POST', headers, body });
  }

  delete(headers: any, id: string) {
    const baseUrl = `/api/v1/code-projects/${id}`;
    return fetch(baseUrl, { method: 'DELETE', headers });
  }
}

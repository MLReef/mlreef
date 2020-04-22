import { getCurrentToken, generateGetRequest } from './apiHelpers';
import { API_GATEWAY, GITLAB_PORT } from '../apiConfig';
import 'babel-polyfill';

export default class GroupsApi {
  static async create(params) {
    const baseUrl = new URL(`${API_GATEWAY}:${GITLAB_PORT}/api/v4/groups`);
    Object.entries(params)
      .forEach((param) => baseUrl.searchParams.append(...param));
    const response = fetch(
      baseUrl, {
        method: 'POST',
        headers: new Headers({
          'PRIVATE-TOKEN': getCurrentToken(),
          'Content-Type': 'application/json',
        }),
      },
    );
    return response;
  }
  
  static async get(params = {}) {
    const baseUrl = new URL(`${API_GATEWAY}:${GITLAB_PORT}/api/v4/groups`);
    Object.entries(params)
      .forEach((param) => baseUrl.searchParams.append(...param));
    const response = generateGetRequest(baseUrl);
    return response;
  }
}

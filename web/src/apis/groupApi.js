import { toastr } from 'react-redux-toastr';
import { getCurrentToken, generateGetRequest } from './apiHelpers';
import { API_GATEWAY } from '../apiConfig';
import 'babel-polyfill';

export default class GroupsApi {
  static async create(params) {
    const baseUrl = new URL(`${API_GATEWAY}/api/v4/groups`);
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
    if (!response.ok) {
      Promise.reject(response);
      toastr.error('Error', 'Server error while creating the experiment');
    }
    return response;
  }

  static async get(params = {}) {
    const baseUrl = new URL(`${API_GATEWAY}/api/v4/groups`);
    Object.entries(params)
      .forEach((param) => baseUrl.searchParams.append(...param));
    const response = generateGetRequest(baseUrl);
    return response;
  }
}

import { API_GATEWAY, GITLAB_PORT } from '../apiConfig';
import { getCurrentToken } from './apiHelpers';

export default class UserApi {
  static updateMeta(meta) {
    // call to future endpoint
    // eslint-disable-next-line
    console.info('updateMeta (prov)', meta);
    return Promise.resolve(true);
  }

  static getUserInfo() {
    const url = `${API_GATEWAY}:${GITLAB_PORT}/api/v4/user`;

    const request = new Request(url, {
      method: 'GET',
      headers: new Headers({
        'PRIVATE-TOKEN': getCurrentToken(),
      }),
    });

    return fetch(request)
      .then((res) => res.ok ? res : Promise.reject(res))
      .then((res) => res.json());
  }

  static updateUserInfo(info) {
    // waiting for the endpoint
    return Promise.resolve(info);
  }
}

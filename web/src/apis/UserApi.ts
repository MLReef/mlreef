import ApiDirector from './ApiDirector';
import { METHODS } from './apiBuilders/requestMethodsEnum';
import BLApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import 'babel-polyfill';

const handleResponse = (res: Response) => res.ok ? res.json() : Promise.reject(res);

export default class UserApi extends ApiDirector {
  async updateMeta(meta: any) {
    // call to future endpoint
    // eslint-disable-next-line
    console.info('updateMeta (prov)', meta);
    return Promise.resolve(true);
  }

  async getUserInfo() {
    const url = '/api/v4/user';
    const builder = new BLApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(), url);
    const response = await fetch(builder.build());
    
    if (!response.ok) {
      window.history.replaceState({ errorCode: 500 }, 'Mlreef', '/error-page');
      window.location.reload();
    }
    return response.json();
  }

  getUserStatus(username: string) {
    const url = `/api/v4/users/${username}/status`;
    const builder = new BLApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(), url);
    return fetch(builder.build())
      .then(handleResponse);
  }

  async updateUserStatus(message: string) {
    const url = `/api/v4/user/status?message=${message}`;
    const builder = new BLApiRequestCallBuilder(METHODS.PUT, this.buildBasicHeaders(), url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  async updateUserInfo(info: any) {
    // waiting for the endpoint
    return Promise.resolve(info);
  }
}

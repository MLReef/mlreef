import ApiDirector from './ApiDirector';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';
import BLApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import { handleResponse } from 'functions/apiCalls';

export default class UserApi extends ApiDirector {
  async updateMeta(meta: any) {
    // call to future endpoint
    // eslint-disable-next-line
    console.info('updateMeta (prov)', meta);
    return Promise.resolve(true);
  }

  async getUserInfo() {
    const url = '/api/v4/user';
    const builder = new BLApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.GITLAB), url);
    const response = await fetch(builder.build());

    if (!response.ok) {
      window.history.replaceState({ errorCode: 500 }, 'Mlreef', '/error-page');
      window.location.reload();
    }
    return response.json();
  }

  getUserStatus(gid: number) {
    const url = `api/v4/users/${gid}/status`;
    const headers = this.buildBasicHeaders(validServicesToCall.GITLAB);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  async updateUserStatus(message: string) {
    const url = `/api/v4/user/status?message=${message}`;
    const builder = new BLApiRequestCallBuilder(METHODS.PUT, this.buildBasicHeaders(validServicesToCall.GITLAB), url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  async updateUserInfo(info: any) {
    // waiting for the endpoint
    return Promise.resolve(info);
  }

  getUserByUsername(username: string) {
    const url = `api/v4/users?username=${username}`;
    const headers = this.buildBasicHeaders(validServicesToCall.GITLAB);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  getGitlabProfile(gid: number) {
    const url = `api/v4/users/${gid}`;
    const headers = this.buildBasicHeaders(validServicesToCall.GITLAB);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }
}

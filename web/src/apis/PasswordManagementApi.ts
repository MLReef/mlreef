import ApiDirector from './ApiDirector';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';
import ApiRequestCallBuilder from './apiBuilders/ApiRequestCallBuilder';
import BLApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import { handleResponse } from 'functions/helpers';

export default class PasswordManagementApi extends ApiDirector {
  async sendResetPassEmail(email: string) {
    const url = `/api/v1/password/reset?email=${email}`;
    const builder = new BLApiRequestCallBuilder(METHODS.POST, this.buildBasicHeaders(validServicesToCall.BACKEND), url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  async confirmPassword(token: string, password: string) {
    const url = `/api/v1/password/reset/confirm`;
    const body = {token, password};
    const builder = new ApiRequestCallBuilder(METHODS.POST, this.buildBasicHeaders(validServicesToCall.BACKEND), url, JSON.stringify(body));

    return fetch(builder.build())
      .then(handleResponse);
  }
}

import ApiDirector from './ApiDirector';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';
import BLApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import 'babel-polyfill';

export default class PasswordManagementApi extends ApiDirector {
  async sendResetPassEmail(email: string) {
    const url = `/api/v1/password/reset?email=${email}`;
    const builder = new BLApiRequestCallBuilder(METHODS.POST, this.buildBasicHeaders(validServicesToCall.BACKEND), url);
    const response = await fetch(builder.build());

    if (!response.ok) {
      return Promise.reject(response);
    }

    return response;
  }
}

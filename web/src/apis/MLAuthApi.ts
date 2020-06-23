
/**
 * core-js and regenerator-runtime imports are necessary to make tests run
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import ApiDirector from './ApiDirector';
import ApiRequestCallBuilder from './apiBuilders/ApiRequestCallBuilder';
import { METHODS } from './apiBuilders/requestEnums';

export default class MLRAuthApi extends ApiDirector {
  async login(username: string, email: string, password: string) {
    const url = '/api/v1/auth/login';
    const builder = new ApiRequestCallBuilder(
      METHODS.POST, 
      this.buildAnonHeaders(), 
      url, 
      JSON.stringify({
        username,
        email,
        password,
      })
    );
    const response = await fetch(builder.build());

    const body = await response.json();
    if (!response.ok) {
      throw new Error(`Bad response from server: ${body.errorName}`);
    }
    return body;
  }

  async register(data: any) {
    const builder = new ApiRequestCallBuilder(
      METHODS.POST, 
      this.buildAnonHeaders(), 
      '/api/v1/auth/register', 
      JSON.stringify(data)
    );
    return fetch(builder.build())
      .then((res) => res.ok ? res.json() : Promise.reject(res));
  }
}

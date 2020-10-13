
/**
 * core-js and regenerator-runtime imports are necessary to make tests run
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import ApiDirector from './ApiDirector';
import ApiRequestCallBuilder from './apiBuilders/ApiRequestCallBuilder';
import { METHODS } from './apiBuilders/requestEnums';
import { handleResponse } from 'functions/helpers';

export default class MLRAuthApi extends ApiDirector {
  login(username: string, email: string, password: string) {
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
    return fetch(builder.build())
      .then(handleResponse)
  }

  register(data: any) {
    const builder = new ApiRequestCallBuilder(
      METHODS.POST, 
      this.buildAnonHeaders(), 
      '/api/v1/auth/register', 
      JSON.stringify(data)
    );
    return fetch(builder.build())
      .then(handleResponse);
  }
}

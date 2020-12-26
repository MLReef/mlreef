import { handleResponse } from 'functions/helpers';
import ApiDirector from './ApiDirector';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';
import BodyLessApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';

class EnvironmentsApi extends ApiDirector {
  getMany() {
    const builder = new BodyLessApiRequestCallBuilder(
      METHODS.GET,
      this.buildBasicHeaders(validServicesToCall.BACKEND),
      '/api/v1/code-projects/environments',
    );

    return fetch(builder.build())
      .then(handleResponse);
  }
}

export default new EnvironmentsApi();

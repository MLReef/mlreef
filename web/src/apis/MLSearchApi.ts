import { handleResponse } from 'functions/helpers';
import ApiDirector from './ApiDirector';
import ApiRequestCallBuilder from './apiBuilders/ApiRequestCallBuilder';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';
import { filterBots, filterRoot } from './apiHelpers';
import BodyLessApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';

export default class MLSearchApi extends ApiDirector {
  /**
   * https://mlreef.gitlab.io/backend/develop/#_get_exploreentriessearch
   * @param body
   * @returns PipelineInstance !!
    maximum body: {
      "searchable_type" : "CODE_PROJECT",
      "query" : "query",
      "query_and" : true,
      "input_data_types" : [ "IMAGE" ],
      "output_data_types" : [ ],
      "tags" : [ "tag1" ],
      "max_stars" : 100,
      "min_stars" : 0
    }'
  */

  search(searchableType: String, body: any, pagQuery: string = '') {
    const url = `/api/v1/explore/entries/search?searchable_type=${searchableType}${pagQuery}`;
    const data = { ...body };
    const BLbuilder = new ApiRequestCallBuilder(
      METHODS.POST,
      this.buildBasicHeaders(validServicesToCall.BACKEND),
      url,
      JSON.stringify(data),
    );

    return fetch(BLbuilder.build())
      .then(handleResponse);
  }

  searchPaginated(searchableType: String, body: any, page: number, size: number) {
    let url = `/api/v1/explore/entries/search?searchable_type=${searchableType}`;
    if (page !== undefined && size !== undefined) {
      url = `${url}&page=${page}&size=${size}`;
    }
    const BLbuilder = new ApiRequestCallBuilder(
      METHODS.POST,
      this.buildBasicHeaders(validServicesToCall.BACKEND),
      url,
      JSON.stringify(body),
    );

    return fetch(BLbuilder.build())
      .then(handleResponse);
  }

  searchRecentProjects() {
    const BLbuilder = new BodyLessApiRequestCallBuilder(
      METHODS.GET,
      this.buildBasicHeaders(validServicesToCall.BACKEND),
      '/api/v1/explore/recent',
    );

    return fetch(BLbuilder.build())
      .then(handleResponse);
  }

  getUsers(q: string) {
    const builder = new BodyLessApiRequestCallBuilder(
      METHODS.GET,
      this.buildBasicHeaders(validServicesToCall.GITLAB),
      `/api/v4/search?scope=users&search=${q}`,
    );

    return fetch(builder.build())
      .then(handleResponse)
      .then((results) => Array.isArray(results) ? results : [])
      .then(filterRoot)
      .then(filterBots);
  }

  searchProjectByName(name: string) {
    const bl = new BodyLessApiRequestCallBuilder(
      METHODS.GET,
      this.buildBasicHeaders(validServicesToCall.GITLAB),
      `/api/v4/search?scope=projects&search=${name}`,
    );
    return fetch(bl.build())
      .then((results) => Array.isArray(results) ? results : []);
  }
}

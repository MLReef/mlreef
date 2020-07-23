import 'core-js/stable';
import 'regenerator-runtime/runtime';
import ApiDirector from './ApiDirector';
import ApiRequestCallBuilder from './apiBuilders/ApiRequestCallBuilder';
import BLApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';

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
  async search(searchableType: String, body: any) {
    const url = `/api/v1/explore/entries/search?searchable_type=${searchableType}`;
    const data = { ...body };
    const BLbuilder = new ApiRequestCallBuilder(METHODS.POST, this.buildBasicHeaders(validServicesToCall.BACKEND), url, JSON.stringify(data));
    const response = await fetch(BLbuilder.build());
    if (!response.ok) {
      const body = await response.json();
      return Promise.reject(body.error_message);
    }
    return response.json();
  }
}

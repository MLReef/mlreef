import ApiDirector from './ApiDirector';
import BodyLessApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';

export default class DataProcessorsApi extends ApiDirector {
  private baseUrl = '/api/v1/data-processors';
  /**
   * @param params url params to filter by
   * @returns {Promise<any>}
   */
  async filterByParams(params: Map<string, string>): Promise<any> {
    const bl = new BodyLessApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.BACKEND), this.baseUrl);
    bl.setUrlParams(params);
    bl.buildUrlWithParams();
    const response = await fetch(bl.build());
    if (!response.ok) {
      return Promise.reject(response);
    }
    return response.json();
  }

  async getParamDetails(id: string): Promise<any> {
    const bl = new BodyLessApiRequestCallBuilder(
      METHODS.GET, 
      this.buildBasicHeaders(validServicesToCall.BACKEND), 
      `${this.baseUrl}/id/${id}/versions`
    );
    const response = await fetch(bl.build());
    if (!response.ok) {
      return Promise.reject(response);
    }
    return response.json();
  }
}

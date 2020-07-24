import 'babel-polyfill';
import ApiDirector from './ApiDirector';
import ApiRequestCallBuilder from './apiBuilders/ApiRequestCallBuilder';
import BodyLessApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';

export default class GroupsApi extends ApiDirector {
  baseUrl = '/api/v1/groups';
  async create(name: string, path: string, description: string, visibility: string, avatar: string) {
    const body = {
      name,
      namespace: path,
      path,
    };
    const builder = new ApiRequestCallBuilder(
      METHODS.POST, 
      this.buildBasicHeaders(validServicesToCall.BACKEND),
      this.baseUrl, 
      JSON.stringify(body)
    );
    
    const response = fetch(builder.build());
    return response
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then(parseToCamelCase)
      .then((group: any) => {
        const blBuilder = new BodyLessApiRequestCallBuilder(
          METHODS.PUT, 
          this.buildBasicHeaders(validServicesToCall.GITLAB), 
          `/api/v4/groups/${group.gitlabId}`
        );
        const params = new Map<string, string>();
        params.set('description', description);
        params.set('visibility', visibility);
        if(avatar !== null){
          params.set('avatar', avatar);
        }
        blBuilder.setUrlParams(params);
        blBuilder.buildUrlWithParams();

        return fetch(blBuilder.build())
      })
      .catch(() => Promise.reject("Error creating group"));
  }

  async searchByParams(isOwned: boolean) {
    const params = new Map();
    params.set('owned', isOwned);
    const builder = new BodyLessApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.GITLAB), '/api/v4/groups');
    builder.setUrlParams(params);
    builder.buildUrlWithParams();
    return fetch(builder.build())
    .then((res) => res.ok ? res.json() : Promise.reject(res))
    .then((groups) => Promise.all(groups.map((grp: { id: any; }) => {
        builder.url = `/api/v4/groups/${grp.id}/projects`;
        return fetch(builder.build())
          .then((res) => res.json())
          .then((projects) => ({
            ...grp,
            projects,
          }))
      }))
    );
  }

  async getUsers(groupId: string) {
    const builder = new BodyLessApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.GITLAB), `/api/v4/groups/${groupId}/members`);
    const response = await fetch(builder.build());
    if(!response.ok){
      return Promise.reject(response);
    }
    return response.json();
  }
}

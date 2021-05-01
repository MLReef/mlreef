import 'babel-polyfill'; 
import { parseToCamelCase } from 'functions/dataParserHelpers';
import { handleResponse } from 'functions/helpers';
import ApiDirector from './ApiDirector';
import ApiRequestCallBuilder from './apiBuilders/ApiRequestCallBuilder';
import BodyLessApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';

// Can we call this GitlabGroupsApi or similar ?
export default class GroupsApi extends ApiDirector {
  /* baseUrl = ''; */

  create(
    name: string, 
    path: string, 
    description: string, 
    visibility: string, 
    avatar: string
  ) {
    const body = {
      name,
      namespace: path,
      path,
    };
    const builder = new ApiRequestCallBuilder(
      METHODS.POST,
      this.buildBasicHeaders(validServicesToCall.BACKEND),
      '/api/v1/groups',
      JSON.stringify(body),
    );

    return fetch(builder.build())
      .then(handleResponse)
      .then(parseToCamelCase)
      .then((group: any) => {
        const blBuilder = new BodyLessApiRequestCallBuilder(
          METHODS.PUT,
          this.buildBasicHeaders(validServicesToCall.GITLAB),
          `/api/v4/groups/${group.gitlabId}`,
        );
        const params = new Map<string, string>();
        params.set('description', description);
        params.set('visibility', visibility);
        if (avatar !== null) {
          params.set('avatar', avatar);
        }
        blBuilder.setUrlParams(params);
        blBuilder.buildUrlWithParams();

        return fetch(blBuilder.build());
      })
  }

  searchByParams(isOwned: boolean) {
    const params = new Map();
    params.set('owned', isOwned);
    const builder = new BodyLessApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.GITLAB), '/api/v4/groups');
    builder.setUrlParams(params);
    builder.buildUrlWithParams();
    return fetch(builder.build())
      .then(handleResponse)
      .then((groups) => Promise.all(groups.map((grp: { id: any; }) => {
        builder.url = `/api/v4/groups/${grp.id}/projects`;
        return fetch(builder.build())
          .then((res) => res.json())
          .then((projects) => ({
            ...grp,
            projects,
          }));
      })));
  }

  getUsers(groupId: string) {
    const builder = new BodyLessApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.GITLAB), `/api/v4/groups/${groupId}/members`);
    return fetch(builder.build())
      .then(handleResponse);
  }
}

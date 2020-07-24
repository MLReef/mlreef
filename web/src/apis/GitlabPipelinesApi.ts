import ApiDirector from "./ApiDirector";
import BodyLessApiRequestCallBuilder from "./apiBuilders/BLApiRequestCallBuilder";
import { METHODS, validServicesToCall } from "./apiBuilders/requestEnums";

export default class GitlabPipelinesApi extends ApiDirector {
  async abortGitlabPipelines(gitlabProjectId: number, pipelineId: number){
    const bl = new BodyLessApiRequestCallBuilder(
      METHODS.POST,
      this.buildBasicHeaders(validServicesToCall.GITLAB),
      `/api/v4/projects/${gitlabProjectId}/pipelines/${pipelineId}/cancel`
    );
    const response = await fetch(bl.build());
    if(!response.ok){
      return Promise.reject(response);
    }

    return response.json();
  }
}

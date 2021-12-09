import { handleResponse } from 'functions/helpers';
import ApiDirector from './ApiDirector';
import ApiRequestCallBuilder from './apiBuilders/ApiRequestCallBuilder';
import BLApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import { METHODS, validServicesToCall } from './apiBuilders/requestEnums';
import { filterBots } from './apiHelpers';
import BodyLessApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import FormReqBuilder from './apiBuilders/FormReqBuilder';

export default class ProjectGeneralInfoApi extends ApiDirector {
  constructor() {
    super();

    this.getProjectsList = this.getProjectsList.bind(this);
    this.getProjectDetails = this.getProjectDetails.bind(this);
  }

  create(bodyReq: any, projectType: string) {
    const baseUrl = `/api/v1/${projectType}s`;
    const apiReqBuilder = new ApiRequestCallBuilder(
      METHODS.POST,
      this.buildBasicHeaders(validServicesToCall.BACKEND),
      baseUrl,
      JSON.stringify(bodyReq),
    );

    return fetch(apiReqBuilder.build())
      .then(handleResponse);
  }

  fork(projectId: string, targetNamespaceGitlabId: number, targetName: string, targetPath: string) {
    const baseUrl = `/api/v1/projects/fork/${projectId}`;
    const bodyReq = {
      // target_namespace_gitlab_id: targetNamespaceGitlabId,
      target_name: targetName,
      // target_path: targetPath,
    };
    const apiReqBuilder = new ApiRequestCallBuilder(
      METHODS.POST,
      this.buildBasicHeaders(validServicesToCall.BACKEND),
      baseUrl,
      JSON.stringify(bodyReq),
    );

    return fetch(apiReqBuilder.build())
      .then(handleResponse);
  }

  getProjectInfoApi(projectId: number) {
    const url = `/api/v4/projects/${projectId}?statistics=true`;
    const builder = new BLApiRequestCallBuilder(
      METHODS.GET,
      this.buildBasicHeaders(validServicesToCall.GITLAB),
      url,
    );

    return fetch(builder.build())
      .then(handleResponse);
  }

  getProjectsList(query: string) {
    const url = '/api/v1/data-projects';
    const builder = new BLApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(validServicesToCall.BACKEND), `${url}${query}`);

    return fetch(builder.build())
      .then(handleResponse);
  }

  getCodeProjectById(projectId: string) {
    const url = `/api/v1/code-projects/${projectId}`;
    const headers = this.buildBasicHeaders(validServicesToCall.BACKEND);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  getVersionDataByBranchAndVId(
    id: string,
    branchId: string,
    versionId: string,
  ) {
    const url = `/api/v1/code-projects/${id}/publish/${branchId}/${versionId}`;
    const headers = this.buildBasicHeaders(validServicesToCall.BACKEND);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  getCodeProjectProcessorByProjectId(projectId: string) {
    const url = `/api/v1/code-projects/${projectId}/processor`;
    const headers = this.buildBasicHeaders(validServicesToCall.BACKEND);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  getMembers(projectId: string) {
    const url = `/api/v1/data-projects/${projectId}/users`;
    const headers = this.buildBasicHeaders(validServicesToCall.BACKEND);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse)
      .then(filterBots);
  }

  addMember(projectId: string, formData: any) {
    const url = `/api/v1/data-projects/${projectId}/users`;
    const headers = this.buildBasicHeaders(validServicesToCall.BACKEND);
    const builder = new ApiRequestCallBuilder(
      METHODS.POST,
      headers,
      url,
      JSON.stringify(formData),
    );

    return fetch(builder.build())
      .then(handleResponse);
  }

  removeMember(projectId: number, userUuid: string) {
    const url = `/api/v1/data-projects/${projectId}/users/${userUuid}`;
    const headers = this.buildBasicHeaders(validServicesToCall.BACKEND);
    const builder = new BLApiRequestCallBuilder(METHODS.DELETE, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  updateProjectDetails(projectId: number, body: Object) {
    const url = `/api/v1/data-projects/${projectId}`;
    const data = { ...body };
    const headers = this.buildBasicHeaders(validServicesToCall.BACKEND);
    const builder = new ApiRequestCallBuilder(METHODS.PUT, headers, url, JSON.stringify(data));

    return fetch(builder.build())
      .then(handleResponse);
  }

  getSlugForValidName(name:string) {
    const url = `/api/v1/project-names/is-available?name=${name}`;
    const headers = this.buildBasicHeaders(validServicesToCall.BACKEND);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build());
  }

  removeProject(id: string) {
    const url = `/api/v1/data-projects/${id}`;
    const headers = this.buildBasicHeaders(validServicesToCall.BACKEND);
    const builder = new BLApiRequestCallBuilder(METHODS.DELETE, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  getUsers(projectId: number) {
    const url = `/api/v4/projects/${projectId}/users`;
    const headers = this.buildBasicHeaders(validServicesToCall.GITLAB);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse)
      .then(filterBots);
  }

  getProjectDetails(namespace: string, slug: string) {
    const url = `/api/v1/projects/${namespace}/${slug}`;
    const headers = this.buildBasicHeaders(validServicesToCall.BACKEND);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  star(projectId: string, isProjectStarred: boolean) {
    const baseUrl = `/api/v1/projects/${projectId}/star`;
    const apiReqBuilder = new BodyLessApiRequestCallBuilder(
      isProjectStarred ? METHODS.DELETE : METHODS.POST,
      this.buildBasicHeaders(validServicesToCall.BACKEND),
      baseUrl,
    );
    return fetch(apiReqBuilder.build())
      .then(handleResponse);
  }

  listStarrers(gId: string) {
    const baseUrl = `/api/v4/projects/${gId}/starrers`;
    const apiReqBuilder = new BodyLessApiRequestCallBuilder(
      METHODS.GET,
      this.buildBasicHeaders(validServicesToCall.GITLAB),
      baseUrl,
    );
    return fetch(apiReqBuilder.build())
      .then(handleResponse);
  }

  publish(
    projectId: string,
    body: any,
  ) {
    const baseUrl = `/api/v1/code-projects/${projectId}/publish`;
    const headers = this.buildBasicHeaders(validServicesToCall.BACKEND);
    const builder = new ApiRequestCallBuilder(METHODS.POST, headers, baseUrl, JSON.stringify(body));

    return fetch(builder.build())
      .then(handleResponse);
  }

  getPublications(
    projectId: string,
  ) {
    const baseUrl = `/api/v1/code-projects/${projectId}/publish`;
    const headers = this.buildBasicHeaders(validServicesToCall.BACKEND);
    const builder = new BodyLessApiRequestCallBuilder(
      METHODS.GET, headers, baseUrl,
    );

    return fetch(builder.build())
      .then(handleResponse);
  }

  getProjectPublishStatus(projectId: string) {
    const url = `/api/v1/code-projects/${projectId}/publish`;
    const headers = this.buildBasicHeaders(validServicesToCall.BACKEND);
    const builder = new BLApiRequestCallBuilder(METHODS.GET, headers, url);

    return fetch(builder.build())
      .then(handleResponse);
  }

  getGitlabRegistries(gitlabProjectId: number) {
    const baseUrl = `/api/v4/projects/${gitlabProjectId}/registry/repositories`;
    const apiReqBuilder = new BodyLessApiRequestCallBuilder(
      METHODS.GET,
      this.buildBasicHeaders(validServicesToCall.GITLAB),
      baseUrl,
    );
    return fetch(apiReqBuilder.build())
      .then(handleResponse);
  }

  getGitlabRegistryTags(gitlabProjectId: number, registryId: number) {
    const baseUrl = `/api/v4/projects/${gitlabProjectId}/registry/repositories/${registryId}/tags`;
    const apiReqBuilder = new BodyLessApiRequestCallBuilder(
      METHODS.GET,
      this.buildBasicHeaders(validServicesToCall.GITLAB),
      baseUrl,
    );
    return fetch(apiReqBuilder.build())
      .then(handleResponse);
  }

  getSingleProjectInfo(namespaceName: string, projectName: string) {
    const baseUrl = `/api/v4/projects/${namespaceName}%2F${projectName}`;
    const apiReqBuilder = new BodyLessApiRequestCallBuilder(
      METHODS.GET,
      this.buildBasicHeaders(validServicesToCall.GITLAB),
      baseUrl,
    );
    return fetch(apiReqBuilder.build())
      .then(handleResponse);
  }

  createCover(projectId: string, file: File) {
    const builder = new FormReqBuilder();
    return fetch(
      builder
        .withUrl(`/api/v1/projects/${projectId}/cover/create`)
        .withHeaders(this.buildHeadersNoContent(validServicesToCall.BACKEND))
        .withFormDataParam('file', file)
        .build(),
    )
      .then(handleResponse);
  }

  updateCover(projectId: string, file: File) {
    const builder = new FormReqBuilder();

    return fetch(
      builder
        .withUrl(`/api/v1/projects/${projectId}/cover/update`)
        .withHeaders(this.buildHeadersNoContent(validServicesToCall.BACKEND))
        .withMethod(METHODS.PUT)
        .withFormDataParam('file', file)
        .build(),
    )
      .then(handleResponse);
  }

  deleteCover(projectId: string) {
    const builder = new FormReqBuilder();

    return fetch(
      builder
        .withUrl(`/api/v1/projects/${projectId}/cover/delete`)
        .withHeaders(this.buildHeadersNoContent(validServicesToCall.BACKEND))
        .withMethod(METHODS.DELETE)
        .build(),
    )
      .then(handleResponse);
  }
}

import ApiDirector from './ApiDirector';
import ApiRequestCallBuilder from './apiBuilders/ApiRequestCallBuilder';
import BLApiRequestCallBuilder from './apiBuilders/BLApiRequestCallBuilder';
import { METHODS } from './apiBuilders/requestMethodsEnum';
import DataProject from 'domain/project/DataProject';
import { plainToClass } from "class-transformer";
import { parseToCamelCase } from 'functions/dataParserHelpers';
import Experiment from 'domain/experiments/Experiment';

export default class ProjectGeneralInfoApi extends ApiDirector {
  async create(settings: any) {
    const baseUrl = '/api/v1/data-projects';
    const data = { ...settings };
    const apiReqBuilder = new ApiRequestCallBuilder(METHODS.POST, this.buildBasicHeaders(), baseUrl, JSON.stringify(data));
    const response = await fetch(apiReqBuilder.build());
    if (!response.ok) {
      const body = await response.json();
      return Promise.reject(body.error_message);
    }
    return response;
  }

  async getProjectInfoApi(projectId: number) {
    const url = `/api/v4/projects/${projectId}?statistics=true`;
    const builder = new BLApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(), url);
    const response = await fetch(builder.build());
    
    if (!response.ok) {
      window.history.replaceState({ errorCode: 500 }, 'Mlreef', '/error-page');
      window.location.reload();
    }
    return response.json();
  }

  async getProjectsList() {
    const url = '/api/v1/data-projects';
    const builder = new BLApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(), url);
    const response = fetch(builder.build());
    return response
      .then(async (res) => {
        if(!res.ok){
          return Promise.reject(res);
        }
        const projectsList = await res.json();
        const dataProjects = plainToClass(DataProject, projectsList.map((p: any) => parseToCamelCase(p)).map((backPro: any) => {
          const newPro = { ...backPro, backendId: backPro.id };
          newPro.experiments = backPro.experiments.map((exp: any) => plainToClass(Experiment, parseToCamelCase(exp)));
          delete newPro.id;
          return newPro;
        }));
        return dataProjects;
      })
  }

  /**
   * @param {*} id: project which will be forked
   * @param {*} namespace: space to fork project to
   * @param {*} name: forked project name
   */
  async forkProject(id: number, namespace: string, name: string) {
    return fetch(new ApiRequestCallBuilder(
      METHODS.POST,
      this.buildBasicHeaders(),
      `/api/v4/projects/${id}/fork`,
      JSON.stringify({
        id, namespace, name,
      })
    ).build());
  }

  removeProject = async (projectId: number) => fetch(
    new BLApiRequestCallBuilder(
      METHODS.DELETE, 
      this.buildBasicHeaders(), 
      `/api/v4/projects/${projectId}`).build()
    );
  
  async getProjectContributors(projectId: number) {
    const url = `/api/v4/projects/${projectId}/members`;
    const builder = new BLApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(), url);
    const response = await fetch(builder.build());

    if (!response.ok) {
      return Promise.reject(response);
    }
    return response;
  }

  async getUsers(projectId: number) {
    const url = `/api/v4/projects/${projectId}/users`;
    const builder = new BLApiRequestCallBuilder(METHODS.GET, this.buildBasicHeaders(), url);
    const response = await fetch(builder.build());
    if (!response.ok) {
      return Promise.reject(response);
    }
    return response.json();
  }
}

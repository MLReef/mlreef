import { toastr } from 'react-redux-toastr';
import ProjectGeneralInfoApi from 'apis/projectGeneralInfoApi';
import * as types from './actionTypes';
import DataProcessorsApi from 'apis/DataProcessorsApi.ts';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import { parseToCamelCase } from 'functions/dataParserHelpers';

const dataProcApi = new DataProcessorsApi();
const projectApi = new ProjectGeneralInfoApi();
/**
 *
 * @param {*} projects: load list for redux global state
 */

export function getProjectsInfoSuccessfully(projects) {
  return { type: types.GET_LIST_OF_PROJECTS, projects };
}

/**
 * get list of projects associated with authenticated user
 */

export function getProjectsList(projectsType) {
  return async (dispatch) => {
    try {
      const projects = await projectApi.getProjectsList(projectsType);
      dispatch(getProjectsInfoSuccessfully(projects));
    } catch (err) {
      throw err;
    }
  };
}

export function setUserProjectsSuccessfully(projects) {
  return { type: types.SET_USER_PROJECTS, projects };
}

/* export function getUserProjects() {
  return (dispatch) => {
    const projectApi = new ProjectGeneralInfoApi();
    projectApi
      .getProjectsList({ owned: true, membership: true })
      .then((projects) => projects && dispatch(setUserProjectsSuccessfully(projects)));
  };
} */

export function setStarredProjectsSuccessfully(projects) {
  return { type: types.SET_STARRED_PROJECTS, projects };
}
/*
export function getStarredProjects() {
  return (dispatch) => new ProjectGeneralInfoApi()
    .getProjectsList({ starred: true })
    .then((projects) => projects && dispatch(setStarredProjectsSuccessfully(projects)));
} */

export function setSelectedProjectSuccesfully(project) {
  return { type: types.SET_SELECTED_PROJECT, project };
}

/**
 * Set the project selected by user in project state so it can be accessed anywhere
 */

export function setSelectedProject(projectSelected) {
  return (dispatch) => {
    dispatch(setSelectedProjectSuccesfully(projectSelected));
  };
}


export function updateProjectsList(projects) {
  return (dispatch) => dispatch({ type: types.UPDATE_PROJECTS_LIST, projects });
}

/**
 *
 * @param {*} projects: load list for redux global state
 */

export function setProjUsersSuccessfully(users) {
  return { type: types.SET_PROJECT_USERS, users };
}

/**
 * get list of users associated with a project
 */

export function getUsersLit(projectId) {
  return (dispatch) => {
    projectApi.getUsers(projectId)
      .then(async (users) => {
        dispatch(
          setProjUsersSuccessfully(
            users,
          ),
        );
      }).catch((err) => {
        toastr.error('Error', err);
      });
  };
}

export function getProjectDetails(id) {
  return (dispatch) => 
    projectApi.getProjectInfoApi(id)
    .then((project) => dispatch({ type: types.SET_SELECTED_PROJECT, project }));
}

/**
 * 
 * This API call fetches code repos corresponding with data processors
 */

export function getDataProcessorsAndCorrespondingProjects(dataOperation) {
  const params = new Map();
  params.set('type', dataOperation);
  return (dispatch) => Promise.all([
    projectApi.getProjectsList(PROJECT_TYPES.CODE_PROJ), 
    dataProcApi.filterByParams(params),
  ]).then((response) => {
    const projects = response[0];
    const dataProcessors = response[1].map((dp) => parseToCamelCase(dp));
    const finalProjects = dataProcessors.filter((dp) => projects.filter((pro) => dp.codeProjectId === pro.id)[0]);
    dispatch(getProjectsInfoSuccessfully(finalProjects));
  }).catch((err) => {
    return Promise.reject(err);
  })
}
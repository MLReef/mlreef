import { toastr } from 'react-redux-toastr';
import ProjectGeneralInfoApi from 'apis/projectGeneralInfoApi';
import { parseToCamelCase, adaptProjectModel } from 'functions/dataParserHelpers';
import MLSearchApi from 'apis/MLSearchApi';
import { handlePagination } from 'functions/apiCalls';
import store from '../store';
import * as types from './actionTypes';

const projectApi = new ProjectGeneralInfoApi();
const mlSearchApi = new MLSearchApi();


// This will fetch gitlab project and add it to the mlreef project
const mergeWithGitlabProject = (project) => projectApi.getProjectInfoApi(project.gitlab_id)
  .then(parseToCamelCase)
  .then((gitlab) => ({ ...project, gitlab }))
  .catch(() => project);

// fetch complementary member list from gitlab api, so far it's not possible
// to get them within each project
const mergeGitlabResource = (projects, auth) => Promise.all(
  projects.map((project) => projectApi.getUsers(project.gitlabId, auth)
    .then((members) => ({ ...project, members }))
    .catch(() => project)),
);


/**
 *
 * @param {*} projects: load list for redux global state
 */

export function getProjectsInfoSuccessfully(projects) {
  return { type: types.GET_LIST_OF_PROJECTS, projects };
}

export function setUserProjectsSuccessfully(projects) {
  return { type: types.SET_USER_PROJECTS, projects };
}

/**
 * get list of projects associated with authenticated user
 */

export function getProjectsList() {
  return async (dispatch) => {
    const { user: { username, auth } } = store.getState();
    let allProjects = [];
    let publicProjects = [];
    if (auth) {
      allProjects = await projectApi.getProjectsList()
        .then((projs) => projs.map(parseToCamelCase))
        .then((projects) => mergeGitlabResource(projects, auth));
    } else {
      publicProjects = await projectApi.listPublicProjects()
        .then(handlePagination)
        .then((projs) => projs.map(parseToCamelCase))
        .then((projects) => mergeGitlabResource(projects, auth));
    }
    const finalArray = [...publicProjects, ...allProjects];
    if (finalArray) {
      const memberProjects = finalArray.filter((project) => project.members?.some((m) => m.username === username));

      dispatch(getProjectsInfoSuccessfully(finalArray));
      dispatch(setUserProjectsSuccessfully(memberProjects));
    }
  };
}

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
  return (dispatch) => projectApi.getProjectInfoApi(id)
    .then((project) => dispatch({ type: types.SET_SELECTED_PROJECT, project }));
}

export function getProjectDetailsBySlug(namespace, slug, options = {}) {
  const requestFn = options.visitor
    ? projectApi.getProjectDetailsNoAuth
    : projectApi.getProjectDetails;

  return (dispatch) => requestFn(namespace, slug)
    .then(mergeWithGitlabProject)
    .then(parseToCamelCase)
    .then(adaptProjectModel)
    .then((project) => dispatch(setSelectedProjectSuccesfully(project)));
}

/**
 *
 * This API call fetches code repos corresponding with data processors
 */

export function getDataProcessorsAndCorrespondingProjects(searchableType, body = {}) {
  return (dispatch) => mlSearchApi
    .search(searchableType, body)
    .then((payload) => payload?.content?.map((contentItem) => contentItem.project))
    .then((projs) => projs.map(parseToCamelCase))
    .then(mergeGitlabResource)
    .then((projects) => {
      if (projects) {
        const { user: { username } } = store.getState();

        const memberProjects = projects.filter((project) =>
          project.members?.some((m) => m.username === username)
        );

        dispatch(getProjectsInfoSuccessfully(projects));
        dispatch(setUserProjectsSuccessfully(memberProjects));
      }
    });
}

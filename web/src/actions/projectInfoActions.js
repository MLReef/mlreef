import { toastr } from 'react-redux-toastr';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import { parseToCamelCase, adaptProjectModel } from 'functions/dataParserHelpers';
import MLSearchApi from 'apis/MLSearchApi';
import { handlePaginationWithAdditionalInfo } from 'functions/apiCalls';
import GitlabPipelinesApi from 'apis/GitlabPipelinesApi';
import store from '../store';
import * as types from './actionTypes';

const projectApi = new ProjectGeneralInfoApi();
const mlSearchApi = new MLSearchApi();
const gitlabPipelinesApi = new GitlabPipelinesApi();

// This will fetch gitlab project and add it to the mlreef project
const mergeWithGitlabProject = (project) => projectApi.getProjectInfoApi(project.gitlab_id)
  .then(parseToCamelCase)
  .then((gitlab) => ({ ...project, gitlab }))
  .catch(() => project);

// fetch complementary member list from gitlab api, so far it's not possible
// to get them within each project
const mergeGitlabResource = (projects) => projects.map((project) => ({
  ...project,
  members: projectApi.getUsers(project.gitlabId),
}));

/**
 *
 * @param {*} projects: load list for redux global state
 */

export function setProjectsInfoSuccessfully(projects) {
  return { type: types.GET_LIST_OF_PROJECTS, projects };
}

export function setUserProjectsSuccessfully(projects) {
  return { type: types.SET_USER_PROJECTS, projects };
}

export function setCodeProjects(codeProjectType, projects) {
  return { type: types.SET_CODE_PROJECTS_ALL, codeProjectType, projects };
}

export function setStarredProjectsSuccessfully(projects) {
  return { type: types.SET_STARRED_PROJECTS, projects };
}

export function setPaginationInfoSuccessfully(pagination) {
  return { type: types.SET_PAGINATION_INFO, pagination };
}

/**
 * get list of projects, function changes the API call depending on the user authentication
 */
/**
 * @param {*} page: number of the page to request
 * @param {*} size: number of the elements to fetch
 */

export const getProjectsList = (page, size) => async (dispatch) => {
  const { user: { username, auth }, projects: stateProjects } = store.getState();
  const { projects, pagination } = await projectApi.getProjectsList(`${auth ? '' : '/public'}?page=${page}&size=${size}`)
    .then(handlePaginationWithAdditionalInfo)
    .then((projsPag) => ({ ...projsPag, projects: mergeGitlabResource(projsPag.content) }));
  if (projects) {
    const filterMember = (ps) => ps.filter((p) => p.members
      .some((m) => m.username === username));

    const completeArrayOfProjects = page > 0 ? [...stateProjects.all, ...projects] : projects;
    dispatch(setProjectsInfoSuccessfully(completeArrayOfProjects));
    dispatch(setStarredProjectsSuccessfully(
      completeArrayOfProjects.filter((proj) => proj?.starsCount > 0),
    ));
    dispatch(setPaginationInfoSuccessfully(pagination));

    Promise.all(completeArrayOfProjects.map((project) => project.members
      .then((members) => ({ ...project, members }))))
      .then(filterMember)
      .then((ms) => dispatch(setUserProjectsSuccessfully(ms)));
  }
};

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

export function getUsersList(projectId) {
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

export function getProjectDetailsBySlug(namespace, slug) {
  return (dispatch) => projectApi.getProjectDetails(namespace, slug)
    .then(mergeWithGitlabProject)
    .then(parseToCamelCase)
    .then(adaptProjectModel)
    .then((project) => dispatch(setSelectedProjectSuccesfully(project)));
}

export function removeProject(id) {
  return (dispatch) => projectApi.removeProject(id)
    .then(() => {
      // clean selectedProject after stack is executed to avoid proptypes warinings
      setTimeout(() => dispatch(setSelectedProjectSuccesfully({})), 0);
    });
}

/**
 *
 * This API call fetches code repos corresponding with data processors
 */

export function getDataProcessorsAndCorrespondingProjects(searchableType, body = {}, options) {
  return (dispatch) => mlSearchApi
    .search(searchableType, body)
    .then((payload) => payload?.content?.map((contentItem) => contentItem.project))
    .then((projs) => projs.map(parseToCamelCase))
    .then(mergeGitlabResource)
    .then((projects) => {
      if (projects) {
        const { user: { username } } = store.getState();

        const filterMember = (ps) => ps.filter((p) => p.members
          .some((m) => m.username === username));

        if (options?.explore) dispatch(setCodeProjects(searchableType, projects));
        else dispatch(setProjectsInfoSuccessfully(projects));

        dispatch(setStarredProjectsSuccessfully(projects.filter((proj) => proj?.starsCount > 0)));

        Promise.all(projects.map((project) => project.members
          .then((members) => ({ ...project, members }))))
          .then(filterMember)
          .then((ms) => dispatch(setUserProjectsSuccessfully(ms)));
      }
    });
}

/**
 * @param {*} gid: id in Gitlab of the project,
 * this action fetches users that have starred a project.
 */

export function setProjectStarrers(projectStarrers) {
  return { type: types.SET_PROJECT_STARRERS, projectStarrers };
}

export function getProjectStarrers(gid) {
  return (dispatch) => projectApi
    .listStarrers(gid)
    .then((starrers) => dispatch(setProjectStarrers(starrers)));
}

/**
 * 
 * @param {*} pipes: pipelines to persist in the redux state
 */

export const setProjectPipelines = (pipes = []) => ({
  type: types.SET_PROJECT_PIPES, pipes,
});

/**
 * 
 * @param {*} gid: project id to get pipelines for
 */

export function getProjectPipelines(gid) {
  return (dispatch) => gitlabPipelinesApi.getPipesByProjectId(gid)
    .then((pipes) => dispatch(setProjectPipelines(pipes)));
}

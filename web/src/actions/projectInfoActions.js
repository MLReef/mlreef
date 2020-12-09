import { toastr } from 'react-redux-toastr';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import { parseToCamelCase, adaptProjectModel } from 'functions/dataParserHelpers';
import MLSearchApi from 'apis/MLSearchApi';
import { handlePaginationWithAdditionalInfo, createPagination } from 'functions/apiCalls';
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

export function setDataProjects({ pagination, projects }) {
  return { type: types.SET_DATA_PROJECTS, pagination, projects };
}

export function setCodeProjects(codeProjectType, { pagination, projects }) {
  return {
    type: types.SET_CODE_PROJECTS,
    codeProjectType,
    pagination,
    projects,
  };
}

export function setStarredProjectsSuccessfully(projects) {
  return { type: types.SET_STARRED_PROJECTS, projects };
}

export function setPaginationInfoSuccessfully(pagination) {
  return { type: types.SET_PAGINATION_INFO, pagination };
}

const buildQuery = (auth, page = 0, size = 10) => `${auth ? '' : '/public'}?page=${page}&size=${size}`;

const setInformationInTheStorage = (username, projects, pagination) => async (dispatch) => {
  const filterMember = (ps) => ps.filter((p) => p.members
    .some((m) => m.username === username));

  dispatch(setProjectsInfoSuccessfully(projects));
  dispatch(setStarredProjectsSuccessfully(
    projects.filter((proj) => proj?.starsCount > 0),
  ));
  dispatch(setPaginationInfoSuccessfully(pagination));

  Promise.all(projects.map((project) => project.members
    .then((members) => ({ ...project, members }))))
    .then(filterMember)
    .then((ms) => dispatch(setUserProjectsSuccessfully(ms)));
};

/**
 * get list of projects, function changes the API call depending on the user authentication
 */
/**
 * @param {*} page: number of the page to request
 * @param {*} size: number of the elements to fetch
 */

export const getProjectsList = (page, size) => async (dispatch) => {
  const { user: { username, auth }, projects: stateProjects } = store.getState();
  const finalQuery = buildQuery(auth, page, size);
  const { projects, pagination } = await projectApi.getProjectsList(finalQuery)
    .then(handlePaginationWithAdditionalInfo)
    .then((projsPag) => ({ ...projsPag, projects: mergeGitlabResource(projsPag.content) }));

  const completeArrayOfProjects = page > 0 ? [...stateProjects.all, ...projects] : projects;
  setInformationInTheStorage(username, completeArrayOfProjects, pagination)(dispatch);
};

export const getPaginatedProjectsByQuery = (query = '', isFirstpage = false) => async (dispatch) => {
  const { user: { username }, projects: stateProjects } = store.getState();
  const { projects, pagination } = await projectApi.getProjectsList(query)
    .then(handlePaginationWithAdditionalInfo)
    .then((projsPag) => ({ ...projsPag, projects: mergeGitlabResource(projsPag.content) }));
  const completeArrayOfProjects = isFirstpage ? projects : [...stateProjects.all, ...projects];
  setInformationInTheStorage(username, completeArrayOfProjects, pagination)(dispatch);
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

export function getDataProcessorsAndCorrespondingProjects(
  searchableType, body = {},
) {
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

        dispatch(setProjectsInfoSuccessfully(projects));

        dispatch(setStarredProjectsSuccessfully(projects.filter((proj) => proj?.starsCount > 0)));

        Promise.all(projects.map((project) => project.members
          .then((members) => ({ ...project, members }))))
          .then(filterMember)
          .then((ms) => dispatch(setUserProjectsSuccessfully(ms)));
      }
    });
}

export function getProcessorsPaginated(
  searchableType, body = {}, page, size,
) {
  return (dispatch) => mlSearchApi
    .searchPaginated(searchableType, body, page, size)
    .then((payload) => payload?.content?.map((contentItem) => contentItem.project))
    .then((projs) => projs.map(parseToCamelCase))
    .then(mergeGitlabResource)
    .then((projects) => {
      if (projects) {
        const { user: { username } } = store.getState();

        const filterMember = (ps) => ps.filter((p) => p.members
          .some((m) => m.username === username));

        dispatch(setProjectsInfoSuccessfully(projects));

        dispatch(setStarredProjectsSuccessfully(projects.filter((proj) => proj?.starsCount > 0)));

        Promise.all(projects.map((project) => project.members
          .then((members) => ({ ...project, members }))))
          .then(filterMember)
          .then((ms) => dispatch(setUserProjectsSuccessfully(ms)));
      }
    });
}

export function getDataProjects(page, size) {
  return (dispatch) => projectApi.getProjectsList(`/public?page=${page}&size=${size}`)
    .then((payload) => ({
      projects: mergeGitlabResource(payload?.content?.map(parseToCamelCase)),
      pagination: createPagination(payload),
    }))
    .then((dataSet) => {
      dispatch(setDataProjects(dataSet));
    });
}

export function getCodeProjects(searchableType, { page, size }, body = {}) {
  return (dispatch) => mlSearchApi
    .search(searchableType, body, `&page=${page}&size=${size}`)
    .then((payload) => ({
      projects: mergeGitlabResource(payload?.content?.map((i) => parseToCamelCase(i.project))),
      pagination: createPagination(payload),
    }))
    .then((codeSet) => {
      dispatch(setCodeProjects(searchableType, codeSet));
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

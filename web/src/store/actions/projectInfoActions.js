import GitlabPipelinesApi from 'apis/GitlabPipelinesApi';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import { parseToCamelCase, adaptProjectModel } from 'functions/dataParserHelpers';
import MLSearchApi from 'apis/MLSearchApi';
import { handlePaginationWithAdditionalInfo, createPagination } from 'functions/apiCalls';
import store from 'store';
import * as types from '../actionTypes';

const projectApi = new ProjectGeneralInfoApi();
const mlSearchApi = new MLSearchApi();
const gitlabPipelinesApi = new GitlabPipelinesApi();

/**
 * @param {*} project: backend project information.
 * @returns: same project but with the Gitlab information.
 */

export const mergeWithGitlabProject = (project) => projectApi.getProjectInfoApi(project.gitlab_id)
  .then(parseToCamelCase)
  .then((gitlab) => ({ ...project, gitlab }))
  .catch(() => project);

/**
 * @param {*} projects: raw projects array to merge with users
 * @returns: same projects array but with the members added
 */
export const mergeGitlabResource = (projects) => projects.map((project) => ({
  ...project,
  members: projectApi.getUsers(project.gitlabId).catch(() => []),
}));


/**
 * get list of projects, function changes the API call depending on the user authentication
 * @param {*} page: number of the page to request
 * @param {*} size: number of the elements to fetch
 */

export const getProjectsList = (page, size) => async (dispatch) => {
  const { user: { auth } } = store.getState();
  projectApi.getProjectsList(`${auth ? '' : '/public'}?page=${page}&size=${size}`)
    .then((paginatedResponse) => paginatedResponse.content.map(parseToCamelCase))
    .then(mergeGitlabResource)
    .then((projects) => dispatch({ type: types.GET_LIST_OF_PROJECTS, projects }));
};

/**
 * @param {*} projects: load list for redux global state
 */

export function setProjUsersSuccessfully(users) {
  return { type: types.SET_PROJECT_USERS, users };
}

/**
 * get list of users associated with a project
 */

export function getUsersList(projectId) {
  return (dispatch) => projectApi
    .getUsers(projectId)
    .then((users) => dispatch(setProjUsersSuccessfully(users)));
}

/**
 *
 * @param {*} namespace: space that contains the project, group or user space.
 * @param {*} slug: url friendly name of the project, UNIQUE.
 * @returns: response example: {
    id: '5d005488-afb6-4a0c-852a-f471153a04b5',
    slug: 'sign-language-classifier',
    url: 'http://gitlab.review-master-8dyme2.35.246.253.255.nip.io/mlreef/sign-language-classifier',
    owner_id: 'aaaa0000-0001-0000-0000-cccccccccccc',
    name: 'Sign Language Classifier Repo 1',
    gitlab_namespace: 'mlreef',
    gitlab_path: 'sign-language-classifier',
    gitlab_id: 21,
    visibility_scope: 'PUBLIC',
    description: 'Description',
    tags: [],
    stars_count: 1,
    forks_count: 0,
    input_data_types: [],
    output_data_types: [],
    searchable_type: 'DATA_PROJECT',
    published: false,
  };
 */
export function getProjectDetailsBySlug(namespace, slug) {
  return (dispatch) => projectApi.getProjectDetails(namespace, slug)
    .then(mergeWithGitlabProject)
    .then(parseToCamelCase)
    .then(adaptProjectModel)
    .then((project) => dispatch({ type: types.SET_SELECTED_PROJECT, project }));
}

/**
 *
 * @param {*} id: the id of the project to be deleted
*/

export function removeProject(id) {
  return (dispatch) => projectApi.removeProject(id)
    .then(() => {
      // clean selectedProject after stack is executed to avoid proptypes warinings
      setTimeout(() => dispatch({ type: types.SET_SELECTED_PROJECT, project: {}}), 0);
    });
}

/**
 *
 * @param {*} searchableType: There can be several types of code projects:
 * ALGORITHM, OPERATION AND VISUALIZATION
 * @param {*} param2: object with pagination information: the page which is
 * the next page of projects that we will fetch,
 * size which is the number of projects that the page will contain
 * @param {*} body: additional searching information.
 *
 * @returns same file structure as getDataProjects function,
 * but content is filled with Code projects
 */

export function setCodeProjects(codeProjectType, { pagination, projects }) {
  return {
    type: types.SET_CODE_PROJECTS,
    codeProjectType,
    pagination,
    projects,
  };
}

export const getCodeProjects = (
  searchableType, 
  { page, size }, 
  body = {}
) => (dispatch) => mlSearchApi
  .search(searchableType, body, `&page=${page}&size=${size}`)
  .then((payload) => ({
    projects: mergeGitlabResource(payload?.content?.map(parseToCamelCase)),
    pagination: createPagination(payload),
  }))
  .then((codeSet) => dispatch(setCodeProjects(searchableType, codeSet)));

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
 *
*/

export const setProjectPipelines = (pipes = []) => ({
  type: types.SET_PROJECT_PIPES, pipes,
});

/**
 * @param {*} gid: project id to get pipelines for
*/

export function getProjectPipelines(gid) {
  return (dispatch) => gitlabPipelinesApi.getPipesByProjectId(gid)
    .then((pipes) => {
      dispatch(setProjectPipelines(pipes))

      return pipes;
    });
}

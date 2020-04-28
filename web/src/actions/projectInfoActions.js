import projectGeneralInfoApi from '../apis/projectGeneralInfoApi';
import * as types from './actionTypes';
import { toastr } from 'react-redux-toastr';

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

export function getProjectsList() {
  return (dispatch) => projectGeneralInfoApi
    .getProjectsList()
    .then(
      (projects) => {
        if (projects) {
          dispatch(
            getProjectsInfoSuccessfully(
              projects,
            ),
          );
        }
      },
    ).catch((err) => {
      throw err;
    });
}

export function setUserProjectsSuccessfully(projects) {
  return { type: types.SET_USER_PROJECTS, projects };
}

export function getUserProjects() {
  return (dispatch) => projectGeneralInfoApi
    .getProjectsList({ owned: true, membership: true })
    .then((projects) => projects && dispatch(setUserProjectsSuccessfully(projects)));
}

export function setStarredProjectsSuccessfully(projects) {
  return { type: types.SET_STARRED_PROJECTS, projects };
}

export function getStarredProjects() {
  return (dispatch) => projectGeneralInfoApi
    .getProjectsList({ starred: true })
    .then((projects) => projects && dispatch(setStarredProjectsSuccessfully(projects)));
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
  return (dispatch) => projectGeneralInfoApi
    .getUsers(projectId)
    .then(async (users) => {
      dispatch(
        setProjUsersSuccessfully(
          users,
        )
      )
    },
    ).catch((err) => {
      toastr.error("Error", err);
    });
}

export function getProjectDetails(id) {
  return (dispatch) => projectGeneralInfoApi
    .getProjectInfoApi(id)
    .then((project) => dispatch({ type: types.SET_SELECTED_PROJECT, project }));
}


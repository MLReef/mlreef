import { SET_PROJECT_USERS } from './actionTypes';
import commitsApi from '../apis/CommitsApi';
/**
 *
 * @param {*} projects: load list for redux global state
 */

export function setProjUsersSuccessfully(users) {
  return { type: SET_PROJECT_USERS, users };
}

/**
   * get list of projects associated with authenticated user
   */

export function getUsersLit(projectId) {
  return (dispatch) => commitsApi
    .getUsers(projectId)
    .then(
      (users) => dispatch(
        setProjUsersSuccessfully(
          users,
        ),
      ),
    ).catch((err) => {
      throw err;
    });
}

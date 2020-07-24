import GroupsApi from 'apis/GroupApi.ts';
import * as types from './actionTypes';

const groupsApi = new GroupsApi();
/**
 *
 * @param {*} projects: set branches list so that it is available for all the views in the project
 */

export function setGroups(groups) {
  return { type: types.GET_USER_GROUPS, groups };
}

/**
 * @param projectId: id of the project which the branches belong to
 *
 */

export const getGroupsList = (isOwned = false) => async (dispatch) => {
  const groups = await groupsApi.searchByParams(isOwned);
  dispatch(setGroups(
    groups,
  ));
};

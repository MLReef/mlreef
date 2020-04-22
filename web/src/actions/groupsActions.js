import * as types from './actionTypes';
import groupsApi from '../apis/groupApi';
import { toastr } from 'react-redux-toastr';

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

export const getGroupsList = () => async (dispatch) => {
  const res = await groupsApi.get();
  if(res.ok){
    const groups = await res.json();
    dispatch(setGroups(
      groups,
    ));
  } else {
    toastr.error("Error", res.statusText);
  }
};

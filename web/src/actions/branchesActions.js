import * as types from './actionTypes';
import branchesApi from '../apis/BranchesApi';

/**
 *
 * @param {*} projects: set branches list so that it is available for all the views in the project
 */

export function setBranchesSuccessfully(branches) {
  return { type: types.SET_LIST_OF_BRANCHES, branches };
}

/**
 * @param projectId: id of the project which the branches belong to
 *
 */

export const getBranchesList = (projectId) => async (dispatch) => {
  const branches = await branchesApi.getBranches(projectId);
  dispatch(setBranchesSuccessfully(
    branches,
  ));
};

export const deleteBranch = (projectId, branch) => () => branchesApi
  .delete(projectId, branch);

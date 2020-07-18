import MergeRequestAPI from '../apis/mergeRequestApi';
import * as types from './actionTypes';

const instance = new MergeRequestAPI();

/**
 *
 * @param {*} mrs: list of merge requests created for the current project
 */

export function getMergeRequestsSuccessfully(mrs) {
  return { type: types.GET_MERGE_REQUESTS, mrs };
}

/**
 * get list of merge requests associated with project
 */

export function getMergeRequestsList(projectId) {
  return (dispatch) => instance
    .getListByProject(projectId)
    .then(
      (mrs) => dispatch(
        getMergeRequestsSuccessfully(
          mrs,
        ),
      ),
    ).catch((err) => {
      throw err;
    });
}

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

export function setMergeRequest(mergeRequest) {
  return { type: types.SET_MERGE_REQUEST, mergeRequest };
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

function updateMergeRequest(gid, iid, payload) {
  return (dispatch) => instance.updateMergeRequest(gid, iid, payload)
    .then((mr) => dispatch(setMergeRequest(mr)));
}

export function getMergeRequest(gid, iid) {
  return (dispatch) => MergeRequestAPI.getSingleMR(gid, iid)
    .then((mergeRequest) => dispatch(setMergeRequest(mergeRequest)));
}

export function closeMergeRequest(gid, iid) {
  return updateMergeRequest(gid, iid, { state_event: 'close' });
}

export function reopenMergeRequest(gid, iid) {
  return updateMergeRequest(gid, iid, { state_event: 'reopen' });
}

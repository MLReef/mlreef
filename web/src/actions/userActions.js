import * as types from './actionTypes';
import UserApi from '../apis/UserApi';

export function updateUserClosedInstructions(closedInstructions) {
  return (dispatch) => UserApi
    .updateMeta({ closedInstructions })
    .then((success) => success
      && dispatch({ type: types.UPDATE_USER_INSTRUCTIONS, closedInstructions }));
}

export function updateUserMeta(meta) {
  return (dispatch) => UserApi
    .updateMeta(meta)
    .then((success) => success && dispatch({ type: types.UPDATE_USER_META, meta }));
}

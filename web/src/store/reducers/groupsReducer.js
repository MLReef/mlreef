import initialState from './initialState';
import * as types from '../actionTypes';

export default function groupsReducer(state = initialState.groups, action) {
  switch (action.type) {
    case types.GET_USER_GROUPS:
      return [...action.groups];

    default:
      return state;
  }
}

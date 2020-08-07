import initialState from './initialState';
import * as types from '../actions/actionTypes';

export default (state = initialState.projects, action) => {
  switch (action.type) {
    case types.GET_MERGE_REQUESTS:
      return { ...state, list: action.mrs };

    case types.SET_MERGE_REQUEST:
      return { ...state, current: action.mergeRequest };

    default:
      return state;
  }
};

import initialState from './initialState';
import * as types from '../actions/actionTypes';

export default (state = initialState.projects, action) => {
  switch (action.type) {
    case types.GET_MERGE_REQUESTS:
      return Object.assign([], action.mrs);
    default:
      return state;
  }
};

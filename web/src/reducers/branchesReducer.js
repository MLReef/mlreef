import initialState from './initialState';
import * as types from '../actions/actionTypes';

export default function branchesReducer(state = initialState.branches, action) {
  switch (action.type) {
    case types.SET_LIST_OF_BRANCHES:
      return Object.assign([], action.branches);
    default:
      return state;
  }
}

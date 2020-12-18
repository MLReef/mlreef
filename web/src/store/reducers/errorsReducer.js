import initialState from './initialState';
import * as types from '../actionTypes';

export default function errorsReducer(state = initialState.errors, action) {
  switch (action.type) {
    case types.SET_ERROR_STATUS:
      return action.errors;

    default:
      return state;
  }
}

import initialState from './initialState';
import * as types from '../actions/actionTypes';

export default function userReducer(state = initialState.user, action) {
  switch (action.type) {
    case types.UPDATE_USER_META:
      return {
        ...state,
        meta: {
          ...state.meta,
          ...action.meta,
        },
      };

    case types.UPDATE_USER_INSTRUCTIONS:
      return {
        ...state,
        meta: {
          ...state.meta,
          closedInstructions: {
            ...state.meta.closedInstructions,
            ...action.closedInstructions,
          },
        },
      };

    default:
      return state;
  }
}

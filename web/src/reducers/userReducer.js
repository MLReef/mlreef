import initialState from './initialState';
import * as types from '../actions/actionTypes';

export default function userReducer(state = initialState.user, action) {
  switch (action.type) {
    case types.LOGIN:
      return {
        ...state,
        ...action.user,
        auth: true,
      };

    case types.LOGOUT:
      return {
        ...state,
        auth: false,
        id: null,
        username: null,
        email: null,
        token: null,
        role: null,
        type: null,
      };

    case types.SET_USER_INFO:
      return {
        ...state,
        userInfo: action.userInfo,
      };

    case types.UPDATE_USER_INFO:
      return {
        ...state,
        ...action.info,
      };

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

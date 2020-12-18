import initialState from './initialState';
import * as types from '../actionTypes';

export default (state = initialState.globalMarker, action) => {
  switch (action.type) {
    case types.SET_GLOBAL_COLOR_MARKER:
      return {
        ...state,
        color: action.color,
      };

    case types.SET_IS_LOADING:
      return {
        ...state,
        isLoading: action.isLoading,
      };

    default:
      return state;
  }
};

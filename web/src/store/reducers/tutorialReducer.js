import initialState from './initialState';
import * as types from '../actionTypes';

export default (state = initialState.tutorial, action) => {
  switch (action.type) {
    case types.TUTORIAL_TOGGLE:
      return {
        ...state,
        active: !state.active,
      };

    case types.TUTORIAL_SET_CURRENT:
      return {
        ...state,
        current: action.current,
      };

    case types.TUTORIAL_UPDATE_CURRENT:
      return {
        ...state,
        current: action.current,
        records: state.records.map((r) => r.id === action.current?.id ? action.current : r),
      };

    case types.TUTORIAL_ADD_STATUS_TO_RECORDS:
      return {
        ...state,
        records: state.records.find((r) => r.id === action.status.id)
          ? state.records.map((r) => r.id === action.status.id ? action.status : r)
          : state.records.concat(action.status),
      };

    case types.TUTORIAL_REMOVE_STATUS_FROM_RECORDS:
      return {
        ...state,
        records: state.records.filter((t) => t.id !== action.status.id),
      };

    case types.TUTORIAL_UPDATE_STATUS_FROM_RECORDS:
      return {
        ...state,
        records: state.records.map((t) => t.id === action.status?.id ? action.status : t),
      };

    default:
      return state;
  }
};

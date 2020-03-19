import initialState from './initialState';
import * as types from '../actions/actionTypes';

export default (state = initialState.actionModal, action) => {
  switch (action.type) {
    case types.ACTION_MODAL_SET_VALUES:
      return {
        ...state,
        isShown: true,
        ...action.values,
      };

    default:
      return state;
  }
};

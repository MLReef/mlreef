import { SET_DATAINSTANCES } from 'store/actionTypes';
import initialState from './initialState';

export default (state = initialState.datainstances, action) => {
  switch (action.type) {
    case SET_DATAINSTANCES:
      return [
        ...action.datainstances,
      ];
    default:
      return state;
  }
};

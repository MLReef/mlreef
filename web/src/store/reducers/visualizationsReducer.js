import { SET_VISUALIZATIONS } from 'store/actionTypes';
import initialState from './initialState';

export default (state = initialState.visualizations, action) => {
  switch (action.type) {
    case SET_VISUALIZATIONS:
      return [
        ...action.visualizations,
      ];
    default:
      return state;
  }
};

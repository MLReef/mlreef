import initialState from './initialState';
import { SET_OPERATIONS, SET_ALGORITHMS, SET_VISUALIZATIONS } from '../actionTypes';

export default function processorReducer(state = initialState.processors, action) {
  switch (action.type) {
    case SET_OPERATIONS:
      state.operations = [...action.operations];
      return { ...state };
    case SET_ALGORITHMS:
      state.algorithms = [...action.algorithms];
      return { ...state };
    case SET_VISUALIZATIONS:
      state.visualizations = [...action.visualizations];
      return { ...state };
    default:
      return state;
  }
}

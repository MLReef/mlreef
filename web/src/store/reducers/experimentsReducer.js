import * as types from '../actionTypes';
import initialState from './initialState';

// eslint-disable-next-line
export default function experimentsReducer(state = initialState.experiments, action) {
  switch (action.type) {
    case types.EXPERIMENTS_SET_PROJECTS_GRAPHS:
      return {
        ...state,
        projects: {
          ...state.projects,
          [action.projectId]: {
            ...(state.projects[action.projectId] || {}),
            graphs: [...action.graphs],
          },
        },
      };

    default:
      return state;
  }
}

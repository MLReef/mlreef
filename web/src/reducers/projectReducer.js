import initialState from './initialState';
import * as types from '../actions/actionTypes';

export default function projectReducer(state = initialState.projects, action) {
  switch (action.type) {
    case types.GET_LIST_OF_PROJECTS:
      state.all = [...action.projects];
      return { ...state };
    case types.SET_SELECTED_PROJECT:
      state.selectedProject = action.project;
      return { ...state };
    case types.UPDATE_PROJECTS_LIST:
      state.all = action.projects;
      return { ...state };

    case types.SET_STARRED_PROJECTS:
      return {
        ...state,
        starredProjects: action.projects,
      };

    case types.SET_USER_PROJECTS:
      return {
        ...state,
        userProjects: action.projects,
      };

    case types.SET_ALL_PROJECTS:
      return {
        ...state,
        all: action.projects,
      };

    default:
      return state;
  }
}

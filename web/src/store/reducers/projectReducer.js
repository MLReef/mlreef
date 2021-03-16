import * as types from '../actionTypes';
import initialState from './initialState';

export default function projectReducer(state = initialState.projects, action) {
  switch (action.type) {
    case types.GET_LIST_OF_PROJECTS:
      return {
        ...state,
        all: action.projects,
      };
    case types.SET_SELECTED_PROJECT:
      return { ...state, selectedProject: action.project };

    case types.SET_PROJECT_STARRERS:
      return {
        ...state,
        selectedProject: {
          ...state.selectedProject,
          projectStarrers: action.projectStarrers,
        },
      };
    case types.SET_PAGINATION_INFO:
      return {
        ...state,
        paginationInfo: {
          ...action.pagination,
        },
      };
    case types.SET_PROJECT_PIPES:
      return {
        ...state,
        selectedProject: {
          ...state.selectedProject,
          pipelines: [
            ...action.pipes,
          ],
        },
      };
    case types.SET_SORTING:
      return {
        ...state,
        sorting: action.sorting,
      }
    default:
      return state;
  }
}

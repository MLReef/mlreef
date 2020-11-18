import initialState from './initialState';
import * as types from '../actions/actionTypes';

export default function projectReducer(state = initialState.projects, action) {
  switch (action.type) {
    case types.GET_LIST_OF_PROJECTS:
      return { 
        ...state,
        all: action.projects,
      };
    case types.SET_SELECTED_PROJECT:
      return { ...state, selectedProject: action.project };
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

    case types.SET_CODE_PROJECTS_ALL:
      return {
        ...state,
        codeProjects: {
          ...state.codeProjects,
          [action.codeProjectType]: {
            ...state.codeProjects[action.codeProjectType],
            all: action.projects,
          },
        },
      };

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
          ...action.pagination
        },
      }
    case types.SET_PROJECT_PIPES:
      return {
        ...state,
        selectedProject: {
          ...state.selectedProject,
          pipelines: [
            ...action.pipes
          ]
        },
      }
    default:
      return state;
  }
}

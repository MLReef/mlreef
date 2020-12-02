import * as types from 'actions/actionTypes';
import initialState from './initialState';

export default function markerplaceReducer(state = initialState.marketplace, action) {
  switch (action.type) {
    case types.SET_DATA_PROJECTS:
      return {
        ...state,
        dataProjects: {
          pagination: action.pagination,
          projects: state.dataProjects.projects.concat(action.projects),
        },
      };

    case types.SET_CODE_PROJECTS:
      return {
        ...state,
        codeProjects: {
          ...state.codeProjects,
          [action.codeProjectType]: {
            pagination: action.pagination,
            projects: state.codeProjects[action.codeProjectType].projects
              .concat(action.projects),
          },
        },
      };

    default:
      return state;
  }
}

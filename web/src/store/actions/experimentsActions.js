import * as types from '../actionTypes';

export function reduceGraphs(projectId, graphs) {
  return { type: types.EXPERIMENTS_SET_PROJECTS_GRAPHS, projectId, graphs };
}

export function setGraphs(projectId, graphs) {
  return (dispatch) => dispatch(reduceGraphs(projectId, graphs));
}

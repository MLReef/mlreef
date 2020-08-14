import * as types from './actionTypes';

export function reduceColor(color) {
  return { type: types.SET_GLOBAL_COLOR_MARKER, color };
}

export function reduceIsLoading(isLoading) {
  return { type: types.SET_IS_LOADING, isLoading };
}

export function setColor(color) {
  return (dispatch) => dispatch(reduceColor(color));
}

export function setIsLoading(isLoading) {
  return (dispatch) => dispatch(reduceIsLoading(isLoading));
}

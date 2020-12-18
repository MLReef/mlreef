import * as types from '../actionTypes';

export function reduceErrors(errors) {
  return { type: types.SET_ERROR_STATUS, errors };
}

export function setErrors(errors) {
  return (dispatch) => dispatch(reduceErrors(errors));
}

export function redirectNotFound() {
  const errors = {
    hasErrors: true,
    info: { code: 404, message: 'Not found' },
  };

  return setErrors(errors);
}

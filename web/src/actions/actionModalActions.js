import * as types from './actionTypes';

export const fireModal = (values) => (dispatch) => {
  dispatch({ type: types.ACTION_MODAL_SET_VALUES, values });
};

export const closeModal = (options) => (dispatch) => {
  const type = options.reset
    ? types.ACTION_MODAL_RESET_STATE
    : types.ACTION_MODAL_SET_VALUES;

  dispatch({ type, values: { isShown: false } });
};

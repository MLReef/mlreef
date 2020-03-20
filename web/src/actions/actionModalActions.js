import * as types from './actionTypes';

export const fireModal = (values) => (dispatch) => {
  dispatch({ type: types.ACTION_MODAL_SET_VALUES, values });
};

export const closeModal = () => (dispatch) => {
  dispatch({ type: types.ACTION_MODAL_SET_VALUES, values: { isShown: false } });
};

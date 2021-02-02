import * as types from '../actionTypes';
import { fireModal } from './actionModalActions';

export const toggleTutorial = () => (dispatch) => {
  dispatch({ type: types.TUTORIAL_TOGGLE });
};

export const setActive = (status) => (dispatch) => {
  dispatch({ type: types.TUTORIAL_SET_ACTIVE, status });
};

export const addStatusToRecords = (status) => (dispatch) => {
  dispatch({ type: types.TUTORIAL_ADD_STATUS_TO_RECORDS, status });
};

export const startTutorial = (current) => (dispatch) => {
  dispatch({ type: types.TUTORIAL_SET_CURRENT, current });
  addStatusToRecords(current)(dispatch);
};

export const updateCurrent = (current = {}) => (dispatch) => {
  dispatch({ type: types.TUTORIAL_UPDATE_CURRENT, current });
};

export const onCompleted = (payload) => (dispatch) => {
  fireModal(payload)(dispatch);
};

export const displayImage = (image) => (dispatch) => {
  fireModal({ type: 'image', align: 'top-left', image })(dispatch);
};

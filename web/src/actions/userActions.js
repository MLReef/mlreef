import * as types from './actionTypes';
import UserApi from '../apis/UserApi';
import MLAuthApi from '../apis/MLAuthApi';

export function login(formData) {
  const { username, email, password } = formData;

  return (dispatch) => MLAuthApi
    .login(username, email, password)
    .then((user) => {
      dispatch({ type: types.LOGIN, user });
      return Promise.resolve(user);
    });
}

export function logout() {
  return (dispatch) => {
    dispatch({ type: types.LOGOUT });
    return Promise.resolve(true);
  };
}

export function updateUserClosedInstructions(closedInstructions) {
  return (dispatch) => UserApi
    .updateMeta({ closedInstructions })
    .then((success) => success
      && dispatch({ type: types.UPDATE_USER_INSTRUCTIONS, closedInstructions }));
}

export function updateUserMeta(meta) {
  return (dispatch) => UserApi
    .updateMeta(meta)
    .then((success) => success && dispatch({ type: types.UPDATE_USER_META, meta }));
}

export function getUserInfo() {
  return (dispatch) => UserApi
    .getUserInfo()
    .then((userInfo) => dispatch({ type: types.SET_USER_INFO, userInfo }));
}

export function updateUserInfo(info) {
  return (dispatch) => UserApi
    .updateUserInfo(info)
    .then(() => dispatch({ type: types.UPDATE_USER_INFO, info }));
}

export function registerUser(data) {
  return (dispatch) => MLAuthApi
    .register(data)
    .then((user) => {
      // if success login and continue
      dispatch({ type: types.LOGIN, user });
      return user;
    });
}

export function setGlobalMarkerColor(color){
  return (dispatch) => dispatch({ type: types.SET_GLOBAL_COLOR_MARKER, color, });
}
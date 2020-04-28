import * as types from './actionTypes';
import UserApi from '../apis/UserApi';
import MLAuthApi from '../apis/MLAuthApi';

export function setLoginInfo(user){
  return { type: types.LOGIN, user };
}

export function login(formData) {
  const { username, email, password } = formData;

  return (dispatch) => MLAuthApi
    .login(username, email, password)
    .then((user) => {
      dispatch(setLoginInfo(user));
      return Promise.resolve(user);
    });
}


export function logoutSuccessfully(){
  return { type: types.LOGOUT };
}

export function logout() {
  return (dispatch) => {
    dispatch(logoutSuccessfully());
    return Promise.resolve(true);
  };
}

export function updateUserInstructionsSuccessfully(closedInstructions) {
  return { type: types.UPDATE_USER_INSTRUCTIONS, closedInstructions };
}

export function updateUserClosedInstructions(closedInstructions) {
  return (dispatch) => UserApi
    .updateMeta({ closedInstructions })
    .then((success) => success
      && dispatch(updateUserInstructionsSuccessfully(closedInstructions)));
}

export function updateUserMetaSuccessfully(meta){
  return { type: types.UPDATE_USER_META, meta };
}

export function updateUserMeta(meta) {
  return (dispatch) => UserApi
    .updateMeta(meta)
    .then((success) => success && dispatch(updateUserMetaSuccessfully(meta)));
}

export function setUserInfo(userInfo){
  return { type: types.SET_USER_INFO, userInfo };
}

export function getUserInfo() {
  return (dispatch) => UserApi
    .getUserInfo()
    .then((userInfo) => dispatch(setUserInfo(userInfo)));
}

export function updateUserInfoSuccessfully(info){
  return { type: types.UPDATE_USER_INFO, info };
}

export function updateUserInfo(info) {
  return (dispatch) => UserApi
    .updateUserInfo(info)
    .then(() => dispatch(updateUserInfoSuccessfully(info)));
}

export function registerUserSuccessfully(user){
  return { type: types.LOGIN, user };
}

export function registerUser(data) {
  return (dispatch) => MLAuthApi
    .register(data)
    .then((user) => {
      // if success login and continue
      dispatch(registerUserSuccessfully(user));
      return user;
    });
}

export function setGlobalMarkerColorSuccessfully(color){
  return { type: types.SET_GLOBAL_COLOR_MARKER, color };
}

export function setGlobalMarkerColor(color){
  return (dispatch) => dispatch(setGlobalMarkerColorSuccessfully(color));
}
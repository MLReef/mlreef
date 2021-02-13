import UserApi from 'apis/UserApi';
import MLAuthApi from 'apis/MLAuthApi';
import * as types from '../actionTypes';

const userApi = new UserApi();
const authApi = new MLAuthApi();

export function setLoginInfo(user) {
  return { type: types.LOGIN, user };
}

export function login(formData) {
  const { username, email, password } = formData;

  return (dispatch) => authApi
    .login(username, email, password)
    .then((user) => {
      dispatch(setLoginInfo(user));
      return Promise.resolve(user);
    });
}

export function logoutSuccessfully() {
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
  return (dispatch) => userApi
    .updateMeta({ closedInstructions })
    .then((success) => success
      && dispatch(updateUserInstructionsSuccessfully(closedInstructions)));
}

export function updateUserMetaSuccessfully(meta) {
  return { type: types.UPDATE_USER_META, meta };
}

export function updateUserMeta(meta) {
  return (dispatch) => userApi
    .updateMeta(meta)
    .then((success) => success && dispatch(updateUserMetaSuccessfully(meta)));
}

export function setUserInfo(userInfo) {
  return { type: types.SET_USER_INFO, userInfo };
}

export function getUserInfo() {
  return (dispatch) => userApi
    .getUserInfo()
    .then((userInfo) => dispatch(setUserInfo(userInfo)));
}

export function updateUserInfoSuccessfully(info) {
  return { type: types.UPDATE_USER_INFO, info };
}

export function updateUserInfo(info) {
  return (dispatch) => userApi
    .updateUserInfo(info)
    .then(() => dispatch(updateUserInfoSuccessfully(info)));
}

export function registerUserSuccessfully(user) {
  return { type: types.LOGIN, user };
}

export function registerUser(data) {
  return (dispatch) => authApi
    .register(data)
    .then((user) => {
      // if success login and continue
      dispatch(registerUserSuccessfully(user));
      return user;
    });
}

export function setProfile(profile) {
  return { type: types.SET_USER_INSPECTED_PROFILE, profile };
}

/**
 * Get user information to display profile page.
 *
 * Get user id with username
 * Get user info with user id
 * Get user status with user id and merge it into profile.
 *
 * @param {String} username
 *
 * @return {Object} profile
 */
export function getProfile(username) {
  return (dispatch) => userApi.getUserByUsername(username)
    .then((users) => users.find((u) => u.username === username))
    .then((user) => user ? user.id : Promise.reject(user))
    .then((gid) => userApi.getGitlabProfile(gid)
      .then((profile) => userApi.getUserStatus(gid)
        .then((status) => {
          const profileWithStatus = { ...profile, status };
          dispatch(setProfile(profileWithStatus));

          return profileWithStatus;
        })));
}

export function setGlobalMarkerColorSuccessfully(color) {
  return { type: types.SET_GLOBAL_COLOR_MARKER, color };
}

export function setGlobalMarkerColor(color) {
  return (dispatch) => dispatch(setGlobalMarkerColorSuccessfully(color));
}

export function setIsLoadingSuccessfully(isLoading) {
  return { type: types.SET_IS_LOADING, isLoading };
}

export function setIsLoading(isLoading) {
  return (dispatch) => dispatch(setIsLoadingSuccessfully(isLoading));
}

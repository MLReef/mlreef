import 'babel-polyfill';
import { storeFactory } from 'functions/testUtils';
import * as userActions from 'actions/userActions';

const user = {
  membership: 1,
  id: null,
  username: null,
  email: null,
  token: null,
  auth: false,
  role: null,
  type: null,
  userInfo: {
    avatar_url: '',
  },
  meta: {
      closedInstructions: {
      EmptyDataVisualization: false,
      DataInstanceOverview: false,
      DataVisualizationOverview: false,
      NewExperiment: false,
      PipeLineView: false,
    },
  },
  globalColorMarker: null,
}

describe('assert user info is updated when actions are triggered', () => {
  let store;
  beforeEach(() => {
    store = storeFactory({ user });
  });
  test('assert that user can login and logout', () => {
    const loggedInUserInfo = {
      ...user,
      auth: true,
      id: 123,
      token: "wenfkwehjf89-efwef77wdqwd-rr",
      role: "some roll",
      type: "some type",
      email: 'testUser@mlreef.com',
      username: 'testUser',
    };
    store.dispatch(userActions.setLoginInfo(loggedInUserInfo)); //login user
    expect(store.getState().user).toStrictEqual(loggedInUserInfo);
    store.dispatch(userActions.logoutSuccessfully());
    const expectedUserInfoAfterLogout = {
      ...user,
      auth: false,
      id: null,
      token: null,
      role: null,
      type: null,
      email: null,
      username: null,
    };
    expect(store.getState().user).toStrictEqual(expectedUserInfoAfterLogout);
  });
  test('assert that meta info is updated', () => {
    const expectedMetaInfo = {
      closedInstructions: {
        EmptyDataVisualization: true,
        DataInstanceOverview: true,
        DataVisualizationOverview: false,
        NewExperiment: false,
        PipeLineView: true,
      }
    };
    store.dispatch(userActions.updateUserMetaSuccessfully(expectedMetaInfo));
    const { user: { meta } } = store.getState();
    expect(meta).toStrictEqual(expectedMetaInfo);
  });
  test('assert that user can register', () => {
    const registeredUserInfo = {
      ...user,
      auth: true,
      id: 123,
      token: "wenfkwehjf89-efwef77wdqwd-rr",
      role: "some roll",
      type: "some type",
      email: 'testUser@mlreef.com',
      username: 'testUser',
    };
    store.dispatch(userActions.registerUserSuccessfully(registeredUserInfo));
    expect(store.getState().user).toStrictEqual(registeredUserInfo);
  });
  test('assert that color marker is updated', () => {
    store.dispatch(userActions.setGlobalMarkerColorSuccessfully('#91BD44'));
    expect(store.getState().user.globalColorMarker).toBe('#91BD44');
  });
});

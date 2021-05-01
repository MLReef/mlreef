import { generatePromiseResponse, storeFactory } from 'functions/testUtils';
import * as userActions from 'store/actions/userActions';

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
  isLoading: false,
};

describe('test auth functions', () => {
  let store;
  const loggedInUserInfo = {
    ...user,
    auth: true,
    id: 123,
    token: 'wenfkwehjf89-efwef77wdqwd-rr',
    role: 'some roll',
    type: 'some type',
    email: 'testUser@mlreef.com',
    username: 'testUser',
  };
  const registeredUserInfo = {
    ...user,
    auth: true,
    id: 123,
    token: 'wenfkwehjf89-efwef77wdqwd-rr',
    role: 'some roll',
    type: 'some type',
    email: 'testUser@mlreef.com',
    username: 'testUser',
  };
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((req) => {
      const respBody = req.url.includes('/login') 
        ? loggedInUserInfo
        : registeredUserInfo
      return generatePromiseResponse(200, true, respBody, 50);
    });
    store = storeFactory({ user });
  });
  test('assert that user can login and logout', async () => {
    await store.dispatch(userActions.login({ username: 'mlreef', email: 'mlreef@gmail.com', password: 'password' })); // login user
    expect(store.getState().user).toStrictEqual(loggedInUserInfo);
    store.dispatch(userActions.logout());
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
  test('assert that user can register', async () => {
    await store.dispatch(userActions.registerUser({}));
    expect(store.getState().user).toStrictEqual(registeredUserInfo);
  });
});

describe('test metadata updation',() => {
  let store;
  beforeEach(() => {
    store = storeFactory({ user });
  })
  test('assert that meta info is updated', () => {
    const expectedMetaInfo = {
      closedInstructions: {
        EmptyDataVisualization: true,
        DataInstanceOverview: true,
        DataVisualizationOverview: false,
        NewExperiment: false,
        PipeLineView: true,
      },
    };
    store.dispatch(userActions.updateUserMetaSuccessfully(expectedMetaInfo));
    const { user: { meta } } = store.getState();
    expect(meta).toStrictEqual(expectedMetaInfo);
  });
  test('assert that color marker is updated', () => {
    store.dispatch(userActions.setGlobalMarkerColorSuccessfully('#91BD44'));
    expect(store.getState().user.globalColorMarker).toBe('#91BD44');
  });
  test('assert that color marker is updated', () => {
    store.dispatch(userActions.setIsLoadingSuccessfully(true));
    expect(store.getState().user.isLoading).toBe(true);
  });
})

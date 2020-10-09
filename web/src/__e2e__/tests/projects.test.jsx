import store from 'store';
import * as types from 'actions/actionTypes';
import MLRAuthApi from 'apis/MLAuthApi';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';

const authApi = new MLRAuthApi();
const projectApi = new ProjectGeneralInfoApi();

beforeEach(async () => {
  if (!store.getState().user.isAuth) {
    await authApi.login('mlreef', 'mlreef@example.org', 'password')
      .then((user) => store.dispatch({ type: types.LOGIN, user }));
  }
});

describe('Create a project', () => {
  test('with wrong payload', async () => {
    let hasErrors;

    const body = {
      papa: 'yap',
    };

    await projectApi.create(body, 'data-project', false)
      .catch((err) => {
        hasErrors = true;
        return err;
      });

    expect(hasErrors).toBe(true);
  });
});

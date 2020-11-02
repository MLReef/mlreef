import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import uuidv1 from 'uuid/v1';
import store from 'store';
import * as types from 'actions/actionTypes';
import MLRAuthApi from 'apis/MLAuthApi';
import UserApi from './apiMocks/UserApi.ts';

const userApi = new UserApi();
const authApi = new MLRAuthApi();
const projectApi = new ProjectGeneralInfoApi();

beforeAll(async () => {
  // ------------- create the user ------------- //
  const suffix = uuidv1().toString().split('-')[0];
  const username = `TEST-ProjectGeneralInfoApi.${suffix}`;
  const password = 'password';
  const email = `TEST-Node.${suffix}@example.com`;
  const registerData = {
    username,
    email,
    password,
    name: username,
  };
  const registerResponse = await userApi.register(registerData);
  expect(registerResponse.ok).toBeTruthy();

  // ----------- login with newly create user ----------- //
  if (!store.getState().user.isAuth) {
    await authApi.login(username, email, password)
      .then((user) => store.dispatch({ type: types.LOGIN, user }));
  }
});

test('Can get public projects ', async () => {
  jest.setTimeout(30000);

  const projects = await projectApi.getProjectsList('/public');
  expect(projects.length > 0).toBe(true);
});

test('Can create project', async () => {
  const request = {
    name: 'Can get Project Info',
    slug: 'can-get-project-info',
    namespace: '',
    initialize_with_readme: false,
    description: '',
    visibility: 'private',
    input_data_types: [],
  };

  const response = await projectApi.create(request, 'data-project', false)
    .catch((err) => {
      expect(true).not.toBe(true);
      return err;
    });

  expect(response.name).toBe(request.name);
  expect(response.slug).toBe(request.slug);
});

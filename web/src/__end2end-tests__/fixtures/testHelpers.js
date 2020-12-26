import MLRAuthApi from 'apis/MLAuthApi';
import store from 'store';
import * as types from 'store/actionTypes';
import moment from 'moment';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import CommitsApi from 'apis/CommitsApi';
import { PROJECT_TYPES } from 'domain/project/projectTypes';

const authApi = new MLRAuthApi();
const userCreationDate = new Date().toISOString().split('T');
const userCreationTime = moment(new Date()).format('hh-mm-ss');
const projectApi = new ProjectGeneralInfoApi();

export default async function assureUserRegistration() {
  const { user } = store.getState();
  if (user.auth) {
    return { registerData: user };
  }
  const userName = `TEST.${userCreationDate[0]}.${userCreationTime}`;
  const Password = 'password';
  const Email = `TEST.${userCreationDate[0]}.${userCreationTime}@example.com`;
  const registerData = {
    username: userName,
    email: Email,
    password: Password,
    name: userName,
  };
  const registrationResponse = await authApi.register(registerData);
  await authApi.login(userName, Email, Password)
    .then((userLoginResp) => store.dispatch({ type: types.LOGIN, user: userLoginResp }));
  return { registerData, registrationResponse };
}

export const assureTestDataProject = async () => {
  const {
    projects: {
      selectedProject,
    },
  } = store.getState();

  if (selectedProject.id) {
    return selectedProject;
  }

  const request = {
    name: 'Test project',
    slug: 'test-project',
    namespace: '',
    initialize_with_readme: false,
    description: '',
    visibility: 'public',
    input_data_types: [],
  };

  const project = await projectApi.create(request, PROJECT_TYPES.DATA_PROJ);

  store.dispatch({ type: types.SET_SELECTED_PROJECT, project });

  return project;
};

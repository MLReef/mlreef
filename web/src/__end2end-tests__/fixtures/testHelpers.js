import MLRAuthApi from 'apis/MLAuthApi';
import store from 'store';
import * as types from 'actions/actionTypes';
import moment from 'moment';

const authApi = new MLRAuthApi();
const userCreationDate = new Date().toISOString().split('T');
const userCreationTime = moment(new Date()).format('hh-mm-ss');

export default async function assureUserRegistration() {
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
    .then((user) => store.dispatch({ type: types.LOGIN, user }));
  return { registerData, registrationResponse };
}

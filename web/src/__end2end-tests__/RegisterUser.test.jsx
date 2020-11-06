import assureUserRegistration from './fixtures/testHelpers';

test('Register user succesfully', async () => {
  const { registrationResponse, registerData } = await assureUserRegistration();
  expect(registrationResponse.username).toEqual(registerData.username);
});

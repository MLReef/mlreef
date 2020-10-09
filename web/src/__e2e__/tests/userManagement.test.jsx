import MLRAuthApi from 'apis/MLAuthApi';

const authApi = new MLRAuthApi();

describe('first suite', () => {
  test('wrong user', async () => {
    let hasErrors;

    const response = await authApi.login('impostor', 'impostor@example.org', 'password')
      .catch((err) => {
        hasErrors = true;
        return err;
      });

    expect(hasErrors).toBe(true);
    expect(response.status).toBe(400);
    expect(response.name).toBe('Bad Request');
  });

  test('correct user', async () => {
    let hasErrors;

    const response = await authApi.login('mlreef', 'mlreef@example.org', 'password')
      .catch((err) => {
        hasErrors = true;
        return err;
      });

    expect(hasErrors).not.toBe(true);
    // if token exists
    expect(!!response.token).toBe(true);
  });
});

import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import uuidv1 from 'uuid/v1';
import store from 'store';
import assureUserRegistration from './fixtures/testHelpers';

const projectApi = new ProjectGeneralInfoApi();
jest.setTimeout(30000);
let originalUUID;

describe('Authenticated user', () => {
  beforeEach(async () => {
    // ----------- login with the user ----------- //
    await assureUserRegistration();
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

    originalUUID = response.id;
  });

  test('Can fork own project ', async () => {
    const request = {
      target_namespace_gitlab_id: -1, // "null" implies forking to user's private namespace
      target_name: 'New Name', // If null, defaults to original name
      target_path: 'new-path', // If null, defaults to original path - needs to be set when forking within the same namespace
    };
    console.log(`Running forking test against id: ${originalUUID}. Request: ${JSON.stringify(request)}`);
    const response = await projectApi.fork(originalUUID, request, false)
      .catch((err) => {
        console.log(err);
        throw new Error(err);
      });

    expect(response.name).toBe(request.target_name);
    expect('new-path').toBe(request.target_path);
  });
});

describe('Create and delete projects', () => {
  test('Can create and delete a project with minimal fields', async () => {
    const tail = uuidv1();
    const type = 'data-project';

    const { user: { username } } = store.getState();

    const body = {
      name: `The simplest project ever ${tail}`,
      // the following fields should not be necessary but backend requires them
      slug: `the-simplest-project-ever-${tail}`,
      namespace: username,
      initialize_with_readme: false,
      description: '',
    };

    const response = await projectApi.create(body, type);

    await projectApi.removeProject(response.id);

    expect(response.name).toBe(body.name);
  });

  test('Can create and delete a public initialized and descripted project', async () => {
    const tail = uuidv1();
    const type = 'data-project';

    const { user: { username } } = store.getState();

    const body = {
      name: `A public initialized and descripted Project ${tail}`,
      slug: `a-public-initialized-and-descripted-project-${tail}`,
      namespace: username,
      initialize_with_readme: true,
      description: 'With one',
      visibility: 'public',
    };

    const response = await projectApi.create(body, type);

    await projectApi.removeProject(response.id);

    expect(response.name).toBe(body.name);
  });

  test('Can create and delete a private empty project', async () => {
    const tail = uuidv1();
    const type = 'data-project';

    const { user: { username } } = store.getState();

    const body = {
      name: `A private empty Project ${tail}`,
      slug: `a-private-empty-project-${tail}`,
      namespace: username,
      visibility: 'private',
      initialize_with_readme: true,
      description: '',
    };

    const response = await projectApi.create(body, type);

    await projectApi.removeProject(response.id);

    expect(response.name).toBe(body.name);
  });
});

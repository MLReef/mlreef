import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import uuidv1 from 'uuid/v1';
import store from 'store';
import assureUserRegistration from './fixtures/testHelpers';

const projectApi = new ProjectGeneralInfoApi();
jest.setTimeout(30000);
let originalUUID;

const defaultUser = 'mlreef';
const forkableProjectName = 'sign-language-classifier';

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

    // eslint-disable-next-line
    originalUUID = response.id;
  });

  test('Can fork a public project ', async () => {
    const { user: { username } } = store.getState();

    const forkable = await projectApi.getProjectDetails(defaultUser, forkableProjectName);

    const response = await projectApi.fork(forkable.id, null, forkable.name);

    const forked = await projectApi.getProjectDetails(username, response.slug);

    expect(forked.name).toBe(forkable.name);

    // still problems for deleting a forked
    // await projectApi.removeProject(forked.id);
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

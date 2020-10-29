import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'router';
import { storeFactory } from 'functions/testUtils';

const visitorStore = storeFactory({
  projects: {
    selectedProject: {
      owner: {
        username: 'mlreef',
      },
      gitlab: {
        namespace: {
          path: 'mlreef',
        },
      },
    },
  },
  user: {

  },
});

const authenticatedStore = storeFactory({
  projects: {
    selectedProject: {
      owner: {
        username: 'mlreef',
      },
      gitlab: {
        namespace: {
          path: 'mlreef',
        },
      },
    },
  },
  user: {
    auth: true,
    username: 'oculus',
  },
});

const simpleMemberStore = storeFactory({
  projects: {
    selectedProject: {
      owner: {
        username: 'mlreef',
      },
      gitlab: {
        permissions: {
          project_access: {
            access_level: 30,
          },
        },
        namespace: {
          path: 'mlreef',
        },
      },
    },
  },
  user: {
    auth: true,
    username: 'oculus',
  },
});

const maintainerStore = storeFactory({
  projects: {
    selectedProject: {
      owner: {
        username: 'mlreef',
      },
      gitlab: {
        permissions: {
          project_access: {
            access_level: 40,
          },
        },
        namespace: {
          path: 'mlreef',
        },
      },
    },
  },
  user: {
    auth: true,
    username: 'oculus',
  },
});

const ownerStore = storeFactory({
  projects: {
    selectedProject: {
      owner: {
        username: 'mlreef',
      },
      gitlab: {
        namespace: {
          path: 'mlreef',
        },
      },
    },
  },
  user: {
    auth: true,
    username: 'mlreef',
  },
});

const routes = [
  {
    name: 'public',
    path: '/public',
    component: () => <main>public</main>,
  },
  {
    name: 'protected',
    path: '/protected',
    component: () => <main>protected</main>,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'owner',
    path: '/owner',
    component: () => <main>owner</main>,
    meta: {
      authRequired: true,
      owneronly: true,
    },
  },
  {
    name: 'maintainer',
    path: '/maintainer',
    debug: false,
    component: () => <main>maintainer</main>,
    meta: {
      authRequired: true,
      role: 40,
    },
  },
  {
    name: 'error',
    path: '/error-page',
    component: () => <main>error</main>,
  },
  {
    name: 'login',
    path: '/login',
    component: () => <main>login</main>,
  },
  {
    name: 'nonExactRoute',
    path: '/non-exact',
    component: () => <main>non-exact</main>,
  },
  {
    name: 'nonExactCreateRoute',
    path: '/non-exact/:id/create',
    component: () => <main>non-exact-create</main>,
  },
  {
    name: 'exactRoute',
    path: '/exact',
    exact: true,
    component: () => <main>exact</main>,
  },
  {
    name: 'exactEditRoute',
    path: '/exact/:id/edit',
    component: () => <main>exact-edit</main>,
  },

  {
    name: 'not-found',
    path: '',
    component: () => <main>not-found</main>,
  },
];

describe('Basics: Assert that a route', () => {
  test('which is unknown render not-found component', () => {
    const wrapper = mount(
      <Provider store={visitorStore}>
        <MemoryRouter routes={routes} initialEntries={['/qwerty/any-slug']} />
      </Provider>,
    );

    expect(wrapper.find('main').text()).toBe('not-found');
  });

  test('without exact match can match a similar', () => {
    const wrapper = mount(
      <Provider store={visitorStore}>
        <MemoryRouter routes={routes} initialEntries={['/non-exact/123/create']} />
      </Provider>,
    );

    expect(wrapper.find('main').text()).toBe('non-exact');
  });

  test('with exact only match exact routes', () => {
    const wrapper = mount(
      <Provider store={visitorStore}>
        <MemoryRouter routes={routes} initialEntries={['/exact/123/edit']} />
      </Provider>,
    );

    expect(wrapper.find('main').text()).toBe('exact-edit');
  });
});

describe('Assert PrivateRoute', () => {
  test('allows visitors for public routes', () => {
    const wrapper = mount(
      <Provider store={visitorStore}>
        <MemoryRouter routes={routes} initialEntries={['/public']} />
      </Provider>,
    );

    expect(wrapper.find('main').text()).toBe('public');
  });

  test('redirects visitors', () => {
    const wrapper = mount(
      <Provider store={visitorStore}>
        <MemoryRouter routes={routes} initialEntries={['/protected']} />
      </Provider>,
    );

    expect(wrapper.find('main').text()).toBe('login');
  });

  test('allows authenticated user', () => {
    const wrapper = mount(
      <Provider store={authenticatedStore}>
        <MemoryRouter routes={routes} initialEntries={['/protected']} />
      </Provider>,
    );

    expect(wrapper.find('main').text()).toBe('protected');
  });
});

describe('Assert with owneronly that PrivateRoute', () => {
  test('redirects visitors to login', () => {
    const wrapper = mount(
      <Provider store={visitorStore}>
        <MemoryRouter routes={routes} initialEntries={['/owner']} />
      </Provider>,
    );

    expect(wrapper.find('main').text()).toBe('login');
  });

  test('redirects authenticated user to error', () => {
    const wrapper = mount(
      <Provider store={authenticatedStore}>
        <MemoryRouter routes={routes} initialEntries={['/owner']} />
      </Provider>,
    );

    expect(wrapper.find('main').text()).toBe('error');
  });

  test('redirects member that is not owner to error', () => {
    const wrapper = mount(
      <Provider store={simpleMemberStore}>
        <MemoryRouter routes={routes} initialEntries={['/owner']} />
      </Provider>,
    );

    expect(wrapper.find('main').text()).toBe('error');
  });

  test('allows user who is owner', () => {
    const wrapper = mount(
      <Provider store={ownerStore}>
        <MemoryRouter routes={routes} initialEntries={['/owner']} />
      </Provider>,
    );

    expect(wrapper.find('main').text()).toBe('owner');
  });
});

describe('Assert that a route with maintainer', () => {
  test('allows owner', () => {
    const wrapper = mount(
      <Provider store={ownerStore}>
        <MemoryRouter routes={routes} initialEntries={['/maintainer']} />
      </Provider>,
    );

    expect(wrapper.find('main').text()).toBe('maintainer');
  });

  test('allows maintainer role', () => {
    const wrapper = mount(
      <Provider store={maintainerStore}>
        <MemoryRouter routes={routes} initialEntries={['/maintainer']} />
      </Provider>,
    );

    expect(wrapper.find('main').text()).toBe('maintainer');
  });

  test('redirects visitors to login', () => {
    const wrapper = mount(
      <Provider store={visitorStore}>
        <MemoryRouter routes={routes} initialEntries={['/maintainer']} />
      </Provider>,
    );

    expect(wrapper.find('main').text()).toBe('login');
  });

  test('redirects other non-maintainer members to error', () => {
    const wrapper = mount(
      <Provider store={simpleMemberStore}>
        <MemoryRouter routes={routes} initialEntries={['/maintainer']} />
      </Provider>,
    );

    expect(wrapper.find('main').text()).toBe('error');
  });

  test('redirects other authenticated to error', () => {
    const wrapper = mount(
      <Provider store={authenticatedStore}>
        <MemoryRouter routes={routes} initialEntries={['/maintainer']} />
      </Provider>,
    );

    expect(wrapper.find('main').text()).toBe('error');
  });
});

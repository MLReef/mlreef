import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { storeFactory } from 'functions/testUtils';
import AuthWrapper from 'components/AuthWrapper';
import initialState from 'store/reducers/initialState';

/*
 * These snapshots should never break!
 *
 * What to do if snapshots changed?
 *
 * Do not update it without a prelimitar check!
 *
 * What could had happened to break a snapshot?
 *
 * Something could have changed in AuthWrapper, permission hooks or gitlab
 * object in selectedProject, therefore the best is to fix those relationships.
 */

// eslint-disable-next-line
const Subject = ({ desc }) => (
  <div>{desc || 'no description'}</div>
);

// a base state
const state = {
  ...initialState,
  projects: {
    ...initialState.projects,
    selectedProject: {
      id: 'project-uuid-001',
      gitlab: {
        owner: {
          username: 'mlreef',
        },
      },
      namespace: {
        path: 'mlreef',
      },
    },
  },
};

const stores = {
  visitor: storeFactory(state),

  authenticated: storeFactory({
    ...state,
    user: {
      ...state.user,
      username: 'calca',
      auth: true,
      token: '123',
    },
  }),

  owner: storeFactory({
    projects: {
      selectedProject: {
        ...state.projects.selectedProject,
        gitlab: {
          ...state.projects.selectedProject.gitlab,
          permissions: {
            project_access: {
              access_level: 40,
            },
          },
        },
      },
    },
    user: {
      ...state.user,
      username: 'mlreef',
      auth: true,
      token: '123',
    },
  }),

  developer: storeFactory({
    ...state,
    projects: {
      ...state.projects,
      selectedProject: {
        ...state.projects.selectedProject,
        gitlab: {
          ...state.projects.selectedProject.gitlab,
          permissions: {
            project_access: {
              access_level: 30,
            },
          },
        },
      },
    },
    user: {
      ...state.user,
      username: 'imadev',
      auth: true,
      token: 'aae1',
    },
  }),
};

describe('Evaluate AuthWrapper', () => {
  test('assert snapshot for visitor', () => {
    const component = renderer.create(
      <main>
        <Provider store={stores.visitor}>
          <section>
            visitor: only auth
            <AuthWrapper>
              <Subject desc="should render covered" />
            </AuthWrapper>
          </section>
          <section>
            visitor: only auth, norender
            <AuthWrapper norender>
              <Subject desc="should not render" />
            </AuthWrapper>
          </section>
          <section>
            visitor: developer covered
            <AuthWrapper minRole={30}>
              <Subject desc="should render covered" />
            </AuthWrapper>
          </section>
          <section>
            visitor: developer, norender
            <AuthWrapper minRole={30} norender>
              <Subject desc="should not render" />
            </AuthWrapper>
          </section>
          <section>
            visitor: owneronly, covered
            <AuthWrapper owneronly>
              <Subject desc="should render covered" />
            </AuthWrapper>
          </section>
          <section>
            visitor: owneronly norender
            <AuthWrapper owneronly norender>
              <Subject desc="should not render" />
            </AuthWrapper>
          </section>
        </Provider>
      </main>,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  test('assert snapshot for authenticated', () => {
    const component = renderer.create(
      <main>
        <Provider store={stores.authenticated}>
          <section>
            authenticated: only auth
            <AuthWrapper>
              <Subject desc="should render" />
            </AuthWrapper>
          </section>
          <section>
            authenticated: only auth, norender
            <AuthWrapper norender>
              <Subject desc="should render" />
            </AuthWrapper>
          </section>
          <section>
            authenticated: developer
            <AuthWrapper minRole={30}>
              <Subject desc="should render covered" />
            </AuthWrapper>
          </section>
          <section>
            authenticated: developer, norender
            <AuthWrapper minRole={30} norender>
              <Subject desc="should not render" />
            </AuthWrapper>
          </section>
          <section>
            authenticated: owneronly norender
            <AuthWrapper owneronly>
              <Subject desc="should render covered" />
            </AuthWrapper>
          </section>
          <section>
            authenticated: owneronly norender
            <AuthWrapper owneronly norender>
              <Subject desc="should not render" />
            </AuthWrapper>
          </section>
        </Provider>
      </main>,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  test('assert snapshot for member of a project', () => {
    const component = renderer.create(
      <main>
        <Provider store={stores.developer}>
          <section>
            developer: only auth
            <AuthWrapper>
              <Subject desc="should render" />
            </AuthWrapper>
          </section>
          <section>
            developer: only auth, norender
            <AuthWrapper norender>
              <Subject desc="should render" />
            </AuthWrapper>
          </section>
          <section>
            developer: developer
            <AuthWrapper minRole={30}>
              <Subject desc="should render" />
            </AuthWrapper>
          </section>
          <section>
            developer: developer, covered
            <AuthWrapper minRole={30} norender>
              <Subject desc="should render" />
            </AuthWrapper>
          </section>
          <section>
            developer: developer w/o perms, covered
            <AuthWrapper minRole={40}>
              <Subject desc="should render covered" />
            </AuthWrapper>
          </section>
          <section>
            developer: developer w/o perms, no render
            <AuthWrapper minRole={40} norender>
              <Subject desc="should not render" />
            </AuthWrapper>
          </section>
          <section>
            developer: owneronly covered
            <AuthWrapper owneronly>
              <Subject desc="should render covered" />
            </AuthWrapper>
          </section>
          <section>
            developer: owneronly norender
            <AuthWrapper owneronly norender>
              <Subject desc="should not render" />
            </AuthWrapper>
          </section>
        </Provider>
      </main>,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  test('assert snapshot for project owner', () => {
    const component = renderer.create(
      <main>
        <Provider store={stores.owner}>
          <section>
            owner: only auth
            <AuthWrapper>
              <Subject desc="should render" />
            </AuthWrapper>
          </section>
          <section>
            owner: only auth, norender
            <AuthWrapper norender>
              <Subject desc="should render" />
            </AuthWrapper>
          </section>
          <section>
            owner: developer
            <AuthWrapper minRole={30}>
              <Subject desc="should render" />
            </AuthWrapper>
          </section>
          <section>
            owner: developer, covered
            <AuthWrapper minRole={30} norender>
              <Subject desc="should render" />
            </AuthWrapper>
          </section>
          <section>
            owner: owneronly covered
            <AuthWrapper owneronly>
              <Subject desc="should render" />
            </AuthWrapper>
          </section>
          <section>
            owner: owneronly norender
            <AuthWrapper owneronly norender>
              <Subject desc="should render" />
            </AuthWrapper>
          </section>
        </Provider>
      </main>,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});

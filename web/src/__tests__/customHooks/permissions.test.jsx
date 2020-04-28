import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { storeFactory } from 'functions/testUtils';
import {
  useGetOwned,
  // useGetHasRole,
  // useGetHasAccountType,
} from 'customHooks/permissions';

const TestHook = ({ callback }) => {
  callback();
  return null;
};

const testHook = (hook, options) => {
  const {
    store,
  } = options;

  mount(
    <Provider store={store}>
      <TestHook callback={hook} />
    </Provider>,
  );
};

const mockedUser = {
  username: 'mlreef',
  id: 1,
  email: 'mlreef@example.org',
  userInfo: {

  },
};

const mockedProjects = {
  all: [
    {
      id: 21,
      namespace: {
        path: 'mlreef',
      },
    },
    {
      id: 22,
      owner: {
        username: 'mlreef',
      },
    },
    {
      id: 23,
      owner: {
        username: 'other',
      },
    },
  ],
  selectedProject: {
    owner: {
      username: 'mlreef',
    },
  },
};

let isOwnerOfSelectedProject;
let isOwnerOfGivenResource;
let isNotOwnerOfGivenResource;
let isTrueWhenOwnerNotRequired;
let isOwnerOfResourceWithoutOwnerKey;

beforeEach(() => {
  const store = storeFactory({
    user: {
      ...mockedUser,
    },
    projects: mockedProjects,
  });

  testHook(() => {
    // testing useGetOwned
    isOwnerOfSelectedProject = useGetOwned(true);
    isOwnerOfResourceWithoutOwnerKey = useGetOwned(true, { type: 'project', id: 21 });
    isOwnerOfGivenResource = useGetOwned(true, { type: 'project', id: 22 });
    isNotOwnerOfGivenResource = useGetOwned(true, { type: 'project', id: 23 });
    isTrueWhenOwnerNotRequired = useGetOwned(false);
  }, { store });
});

describe('test useGetOwned', () => {
  test('assert true if is owner of selectedProject', () => {
    expect(isOwnerOfSelectedProject).toBe(true);
  });

  test('assert true if is owner of a given resource', () => {
    expect(isOwnerOfGivenResource).toBe(true);
  });

  test('assert true if is owner of given resource w/o owner key', () => {
    expect(isOwnerOfResourceWithoutOwnerKey).toBe(true);
  });

  test('assert false if is not owner of SelectedProject', () => {
    expect(isNotOwnerOfGivenResource).toBe(false);
  });

  test('assert true ownership is not required', () => {
    expect(isTrueWhenOwnerNotRequired).toBe(true);
  });
});

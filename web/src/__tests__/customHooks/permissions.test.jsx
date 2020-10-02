import { storeFactory } from 'functions/testUtils';
import { testHook } from 'setupTests';
import {
  useGetOwned,
  // useGetHasRole,
  // useGetHasAccountType,
} from 'customHooks/permissions';

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
      gitlab: {
        owner: {
          username: 'mlreef',
        },
      },
    },
    {
      id: 22,
      gitlab: {
        owner: {
          username: 'mlreef',
        },
      },
    },
    {
      id: 23,
      gitlab: {
        owner: {
          username: 'other',
        },
      },
    },
  ],
  selectedProject: {
    gitlab: {
      owner: {
        username: 'mlreef',
      },
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
    isOwnerOfSelectedProject = useGetOwned();
    isOwnerOfResourceWithoutOwnerKey = useGetOwned({ type: 'project', id: 21 });
    isOwnerOfGivenResource = useGetOwned({ type: 'project', id: 22 });
    isNotOwnerOfGivenResource = useGetOwned({ type: 'project', id: 23 });
    isTrueWhenOwnerNotRequired = useGetOwned();
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

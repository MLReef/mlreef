import { PROJECT_TYPES } from 'domain/project/projectTypes';

export default {
  branches: [],
  jobs: [],
  projects: {
    all: [],
    userProjects: [],
    starredProjects: [],
    selectedProject: {},
    codeProjects: {
      [PROJECT_TYPES.ALGORITHM]: {
        all: [],
        starred: [],
        userProjects: [],
      },
      [PROJECT_TYPES.OPERATION]: {
        all: [],
        starred: [],
        userProjects: [],
      },
      [PROJECT_TYPES.VISUALIZATION]: {
        all: [],
        starred: [],
        userProjects: [],
      },
    },
    paginationInfo: {}
  },
  users: [],
  processors: {
    operations: [],
    algorithms: [],
    visualizations: [],
  },
  mergeRequests: {
    list: [],
    current: {},
  },
  user: {
    membership: 1,
    id: null,
    username: null,
    email: null,
    token: null,
    auth: false,
    role: null,
    type: null,
    userInfo: {
      avatar_url: '',
    },
    meta: {
      closedInstructions: {
        EmptyDataVisualization: false,
        DataInstanceOverview: false,
        DataVisualizationOverview: false,
        NewExperiment: false,
        PipeLineView: false,
      },
    },
    globalColorMarker: null,
    isLoading: false,
    preconfiguredOperations: null,
    inspectedProfile: {},
  },
  actionModal: {
    title: 'Modal title',
    subtitle: '',
    content: '',
    positiveLabel: 'Accept',
    onPositive: (val) => {
      return Promise.resolve(val);
    },
    negativeLabel: 'Cancel',
    onNegative: () => Promise.resolve(false),
    ignoreLabel: '',
    isShown: false,
    closable: true,
  },
  globalMarker: {
    color: null,
    isLoading: false,
  },
  groups: [],
};

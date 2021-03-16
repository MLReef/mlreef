import { PROJECT_TYPES } from 'domain/project/projectTypes';

export default {
  branches: [],
  jobs: [],
  marketplace: {
    dataProjects: {
      projects: [],
      pagination: {},
    },
    codeProjects: {
      [PROJECT_TYPES.ALGORITHM]: {
        projects: [],
        pagination: {},
      },
      [PROJECT_TYPES.OPERATION]: {
        projects: [],
        pagination: {},

      },
      [PROJECT_TYPES.VISUALIZATION]: {
        projects: [],
        pagination: {},
      },
    },
  },
  projects: {
    all: [],
    userProjects: [],
    starredProjects: [],
    selectedProject: {},
    paginationInfo: {},
    sorting: 'ALL',
  },
  users: [],
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
    onPositive: (val) => Promise.resolve(val),
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
  tutorial: {
    active: true,
    current: {
      id: null,
      total: null,
      step: null,
      task: null,
      done: [0, 0],
    },
    records: [],
  },
  groups: [],
  errors: {
    hasErrors: false,
    info: {
      code: undefined,
      message: undefined,
      silent: false,
    },
  },
  visualizations: [],
  datainstances: [],
};

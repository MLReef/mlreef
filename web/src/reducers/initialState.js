export default {
  files: [],
  file: { pathToFile: '' },
  branches: [],
  jobs: [],
  projects: {
    all: [],
    userProjects: [],
    starredProjects: [],
    selectedProject: {},
  },
  users: [],
  mergeRequests: [],
  user: {
    id: null,
    username: null,
    email: null,
    token: null,
    auth: false,
    role: null,
    type: null,
    meta: {
      closedInstructions: {
        EmptyDataVisualization: false,
        DataInstanceOverview: false,
        DataVisualizationOverview: false,
        NewExperiment: false,
        PipeLineView: false,
      },
    },
  },
};

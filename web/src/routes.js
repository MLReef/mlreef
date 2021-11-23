import { Redirect } from 'react-router-dom';
import LoginView from 'components/views/login/login';
import RegisterView from 'components/views/RegisterView';
import ResetPasswordView from 'components/views/ResetPassword/ResetPasswordView';
import PasswordConfirmationView from 'components/views/ResetPassword/PasswordConfirmationView';
import ErrorView from 'components/views/ErrorView';
import RegisterLandingView from 'components/views/RegisterView/RegisterLandingView';
import GroupsOverview from 'components/views/groupsOverview';
import GroupsView from 'components/views/MlreefGroups/GroupView';
import UserAccountView from 'components/views/userSettings/UserAccount';
import ProfileView from 'components/views/userProfile/userProfile';
import DetailedProjectView from 'components/views/DetailedProjectView/DetailedProjectView';
import CreateProjectView from 'components/views/CreateProject/createProject';
import BranchesView from 'components/views/BranchesListView/branchesView';
import NewBranchView from 'components/views/NewBranch';
import MergeRequestsView from 'components/views/MergeRequests/MergeRequestsOverview';
import NewMergeRequestView from 'components/views/MergeRequests/NewMergeReq';
import DataInstancesView from 'components/views/Datainstances/DataInstancesOverview';
import DataInstanceDetailsView from 'components/views/Datainstances/dataInstanceDetails';
import ExperimentsView from 'components/views/ExperimentsView/ExperimentsView';
import ExperimentDetailsView from 'components/views/ExperimentDetails/ExperimentDetail';
import FunctionalExecutionPipelinesView from 'components/views/PipelinesExecutionView';
import VisualizationsView from 'components/views/DataVisualization/dataVisualizationOverview';
import VisualizationDetailView from 'components/views/DataVisualization/dataVisualizationDetail';
import SettingsView from 'components/views/SettingsView';
import CreateGroupView from 'components/views/CreateGroup/createGroup';
import CommitsView from 'components/views/CommitsView/CommitView';
import InsightsView from 'components/views/ExperimentInsights/ExperimentInsights';
import UploadFileView from 'components/views/uploadFile/uploadFile';
import CommitDetailsView from 'components/views/CommitsDetails/commitDetails';
import ForkView from 'components/views/ForkView';
import ForkProgressView from 'components/views/ForkView/ForkProgressView';
import PublishingView from 'components/views/PublishingView';
import PublishProcessView from 'components/views/PublishProcessView';
import DashboardV2 from 'components/views/DashboardV2';
import NotFoundView from 'components/views/ErrorView/NotFoundView';
import TutorialView from 'components/views/TutorialView/TutorialView';

// this is component for testing layout and should be removed after alpha
import DemoView from 'components/Demo';
import DetailedRepositoryView from 'components/views/DetailedRepositoryView';
import DashboardExplore from 'components/views/DashboardExplore/DashboardExplore';
import Publications from 'components/views/Publications/Publications';
import FileEditor from 'components/views/FileEditor';
import ImportDataOverview from 'components/views/ImportDataOverview';
import Fileview from 'components/views/FileviewComp/Fileview';
import BasicMergeRequestView from 'components/views/MergeRequestDetails/basicMergeRequestView';
import RegisterRedirectionView from 'components/views/RegisterRedirectionView/RegisterRedirectionView';

export default [
  {
    name: 'dashboard-v2',
    path:
      '/dashboard/:classification1/:classification2/repository-name/:repoName',
    exact: true,
    component: DashboardV2,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'dashboard-v2',
    path: '/dashboard/:classification1/:classification2',
    exact: true,
    component: DashboardV2,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'dashboard-v2',
    path: '/dashboard',
    exact: true,
    component: DashboardV2,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'explore-v2',
    path: '/explore/:classification1/:classification2',
    exact: true,
    component: DashboardExplore,
  },
  {
    name: 'explore-v2',
    path:
      '/explore/:classification1/:classification2/repository-name/:repoName',
    exact: true,
    component: DashboardExplore,
  },
  {
    name: 'explore-v2',
    path: '/explore/:classification1',
    exact: true,
    component: DashboardExplore,
  },
  {
    name: 'explore-v2',
    path: '/explore',
    exact: true,
    component: DashboardExplore,
  },
  {
    name: 'notFound',
    path: '/not-found/:info?',
    component: NotFoundView,
  },
  {
    name: 'error',
    path: '/error-page',
    component: ErrorView,
  },
  {
    name: 'demo',
    path: '/demo',
    exact: true,
    component: DemoView,
  },
  // login and register routes
  {
    name: 'login',
    path: '/login',
    component: LoginView,
  },
  {
    name: 'register',
    path: '/register',
    component: RegisterView,
  },
  {
    name: 'passwordReset',
    path: '/reset-password',
    component: ResetPasswordView,
  },
  {
    name: 'passwordConfirmation',
    path: '/login/password-reset/:token',
    component: PasswordConfirmationView,
  },
  {
    name: 'tutorial',
    path: '/tutorial',
    component: TutorialView,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'welcome',
    path: '/welcome',
    component: RegisterLandingView,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'newGroup',
    path: '/groups/new',
    exact: true,
    component: CreateGroupView,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'groups',
    path: '/groups',
    exact: true,
    component: GroupsOverview,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'groupsOverview',
    path: '/groups/:groupPath',
    exact: true,
    component: GroupsView,
  },
  {
    name: 'redirect',
    path: '/redirect/:action',
    component: Redirect,
  },
  {
    name: 'userProfile',
    path: '/profile',
    component: UserAccountView,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'profile',
    path: '/:user',
    exact: true,
    component: ProfileView,
  },
  {
    name: 'redirection',
    path: '/user/oauth-reroute',
    component: RegisterRedirectionView,
    meta: {
      authRequired: false,
    },
  },
  // project view section
  {
    name: 'project',
    path: '/:namespace/:slug',
    exact: true,
    component: DetailedProjectView,
  },
  {
    name: 'projectSettings',
    path: '/:namespace/:slug/-/settings',
    exact: true,
    component: SettingsView,
    meta: {
      authRequired: true,
      role: 40,
    },
  },
  {
    name: 'file-creation-1',
    path:
      '/:namespace/:slug/-/tree/branch/:branch/path/:path/file/editor/:action',
    component: FileEditor,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'file-creation-2',
    path: '/:namespace/:slug/-/tree/branch/:branch/file/editor/:action',
    component: FileEditor,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'file-creation-3',
    path: '/:namespace/:slug/-/tree/file/editor/:action',
    component: FileEditor,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'projectBranchFolder',
    path: '/:namespace/:slug/-/tree/:branch/:path(.+)',
    component: DetailedProjectView,
  },
  {
    name: 'projectBranch',
    path: '/:namespace/:slug/-/tree/:branch',
    component: DetailedProjectView,
  },
  {
    name: 'createProject',
    path: '/new-project/classification/:classification/:groupNamespace?',
    exact: true,
    component: CreateProjectView,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'fork',
    path: '/:namespace/:slug/-/fork',
    component: ForkView,
    exact: true,
    meta: {
      authRequired: true,
    },
  },
  {
    // this is in case of long fork, projectView will redirect here
    name: 'fork-progress',
    path: '/:namespace/:slug/-/fork-progress',
    component: ForkProgressView,
    exact: true,
    meta: {
      authRequired: true,
    },
  },
  // branch list and create
  {
    name: 'branches',
    path: '/:namespace/:slug/-/branches',
    exact: true,
    component: BranchesView,
  },
  {
    name: 'newBranch',
    path: '/:namespace/:slug/-/branches/new',
    component: NewBranchView,
    meta: {
      authRequired: true,
    },
  },

  // files
  {
    name: 'fileCommit',
    path: '/:namespace/:slug/-/blob/commit/:commit/path/:file(.+)',
    exact: true,
    component: Fileview,
  },
  {
    name: 'fileBranch',
    path: '/:namespace/:slug/-/blob/branch/:branch(.+)/path/:file(.+)',
    exact: true,
    component: Fileview,
  },
  {
    name: 'uploadFile',
    path: '/:namespace/:slug/:branch(.+)/upload-file',
    component: UploadFileView,
    exact: true,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'uploadFileBranch',
    path: '/:namespace/:slug/:branch(.+)/upload-file/path/:path(.+)?',
    component: UploadFileView,
    exact: true,
    meta: {
      authRequired: true,
    },
  },
  // Merge Request view section
  {
    name: 'mergeRequests',
    path: '/:namespace/:slug/-/merge_requests',
    exact: true,
    component: MergeRequestsView,
  },
  {
    name: 'newMergeRequest',
    // for compatibility with git cli
    path: '/:namespace/:slug/(-/|)merge_requests/new',
    component: NewMergeRequestView,
    exact: true,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'basicMergeRequest',
    path: '/:namespace/:slug/-/merge_requests/:iid',
    component: BasicMergeRequestView,
  },
  {
    name: 'datasets',
    path: '/:namespace/:slug/-/datasets',
    exact: true,
    component: DataInstancesView,
  },
  {
    name: 'newDataset',
    path: '/:namespace/:slug/-/datasets/new',
    component: FunctionalExecutionPipelinesView,
    exact: true,
    meta: {
      authRequired: true,
      newDataset: true,
    },
  },
  {
    name: 'dataSetRebuild',
    path: '/:namespace/:slug/-/datasets/:dataId/rebuild',
    exact: true,
    component: FunctionalExecutionPipelinesView,
  },
  {
    name: 'dataset',
    path: '/:namespace/:slug/-/datasets/:dataId',
    exact: true,
    component: DataInstanceDetailsView,
  },
  {
    name: 'datasetBranchPath',
    path: '/:namespace/:slug/-/datasets/:branch/:dataId/path/:path',
    component: DataInstanceDetailsView,
  },
  {
    name: 'experimentRbuild',
    path: '/:namespace/:slug/-/experiments/:dataId/rebuild',
    exact: true,
    component: FunctionalExecutionPipelinesView,
  },
  {
    name: 'experiments',
    path: '/:namespace/:slug/-/experiments',
    component: ExperimentsView,
    exact: true,
  },
  {
    name: 'newExperiment',
    path: '/:namespace/:slug/-/experiments/new',
    component: FunctionalExecutionPipelinesView,
    exact: true,
    meta: {
      authRequired: true,
      newExperiment: true,
    },
  },
  {
    name: 'experiment',
    path: '/:namespace/:slug/-/experiments/:experimentId',
    component: ExperimentDetailsView,
    meta: {
      authRequired: true,
    },
  },

  {
    name: 'visualizationsRebuild',
    path: '/:namespace/:slug/-/visualizations/:dataId/rebuild',
    exact: true,
    component: FunctionalExecutionPipelinesView,
  },
  {
    name: 'visualizations',
    path: '/:namespace/:slug/-/visualizations',
    component: VisualizationsView,
    exact: true,
  },
  {
    name: 'newVisualizations',
    path: '/:namespace/:slug/-/visualizations/new',
    component: FunctionalExecutionPipelinesView,
    exact: true,
    meta: {
      authRequired: true,
      newVisualization: true,
    },
  },
  {
    name: 'visualization',
    path: '/:namespace/:slug/-/visualizations/:visId',
    component: VisualizationDetailView,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'visualizationBranch',
    path: '/:namespace/:slug/-/visualizations/:visId/path/:path',
    component: VisualizationDetailView,
    meta: {
      authRequired: true,
    },
  },
  // insights
  {
    name: 'insightJob',
    path: '/:namespace/:slug/insights/-/jobs/:logId',
    component: InsightsView,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'insights',
    path: '/:namespace/:slug/insights/-/jobs',
    component: InsightsView,
    exact: true,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'branchCommitsFile',
    path: '/:namespace/:slug/-/commits/file/:branch(.+)/-/:path(.+)',
    component: CommitsView,
    exact: true,
  },
  {
    name: 'commitDetails',
    path: '/:namespace/:slug/-/commits/:branch(.+)/-/:commitHash',
    component: CommitDetailsView,
    exact: true,
  },
  {
    name: 'branchCommits',
    path: '/:namespace/:slug/-/commits/:branch(.+)',
    component: CommitsView,
    exact: true,
  },
  // publishing
  {
    name: 'publishingProcess',
    path: '/:namespace/:slug/-/publishing/process',
    component: PublishProcessView,
    exact: true,
    meta: {
      authRequired: true,
      role: 40,
    },
  },
  {
    name: 'specificPublication',
    path: '/:namespace/:slug/-/publications/:pipelineId',
    component: PublishProcessView,
    exact: true,
    meta: {
      authRequired: true,
      // role: 40,
    },
  },
  {
    name: 'publishing',
    path: '/:namespace/:slug/-/publishing',
    component: PublishingView,
    exact: true,
    meta: {
      authRequired: true,
      role: 40,
    },
  },
  {
    name: 'publishing',
    path: '/:namespace/:slug/-/publishing',
    component: PublishingView,
    exact: true,
    meta: {
      authRequired: true,
      role: 40,
    },
  },
  {
    name: 'publications',
    path: '/:namespace/:slug/-/publications',
    component: Publications,
    exact: true,
  },
  {
    name: 'detailed-view-1',
    path: '/:namespace/:slug/-/repository/tree/-/branch/:branch/path/:path',
    component: DetailedRepositoryView,
    exact: true,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'detailed-view-2',
    path: '/:namespace/:slug/-/repository/tree/-/commit/:commit/path/:path',
    component: DetailedRepositoryView,
    exact: true,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'detailed-view-3',
    path: '/:namespace/:slug/-/repository/tree/-/commit/:commit',
    component: DetailedRepositoryView,
    meta: {
      authRequired: true,
    },
  },
  {
    name: 'import-data',
    path: '/:namespace/:slug/-/import-data/-/overview',
    exact: true,
    component: ImportDataOverview,
  },
  {
    name: 'home',
    path: '/',
    exact: true,
    component: DashboardV2,
  },
  {
    name: 'empty',
    path: '',
    component: DashboardV2,
  },
];

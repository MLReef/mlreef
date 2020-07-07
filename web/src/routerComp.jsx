import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import UserAccount from 'components/views/userSettings/UserAccount';
import CreateGroup from 'components/views/create-group/createGroup';
import SettingsView from 'components/views/SettingsView';
import FileView from './components/fileView/fileView';
import Login from './components/login/login';
import RegisterView from './components/RegisterView';
import projectView from './components/projectView/projectView';
import PipeLineView from './components/pipeline-view/pipelineView';
import PrivateRoute from './privateRoute';
import ExperimentsOverview from './components/experiments-overview/experimentsOverview';
import Projects from './components/myProjects/myProjects';
import Commits from './components/commits-view/commitsView';
import CommitDetails from './components/commits-details/commitDetails';
import NewExperiment from './components/newExperiment';
import DataInstanceOverview from './components/data-instance/dataInstanceOverview';
import DataInstanceDetails from './components/data-instance/dataInstanceDetails';
import DataVisualizationOverview from './components/data-visualization/dataVisualizationOverview';
import EmptyDataVisualization from './components/data-visualization/dataVisualization';
import ErrorPage from './components/error-page/errorPage';
import ExperimentDetails from './components/experiment-details/experimentDetails';
import CreateProject from './components/views/create-project/createProject';
import NewMergeRequest from './components/new-merge-request/newMergeRequest';
import NewBranch from './components/newBranch';
import BranchesView from './components/branches-list-view/branchesView';
import mergeRequestOverview from './components/new-merge-request/merge-request-overview';
import BasicMergeRequestView from './components/mergeRequestDetailView/basicMergeRequestView';
import UserProfile from './components/userProfile/userProfile';
import UploadFile from './components/views/uploadFile/uploadFile';
import DataVisualizationDetail from './components/data-visualization/dataVisualizationDetail';
import ForkView from './components/ForkView';
import Insights from './components/insights/insights';
// this is component for testing layout and should be removed after alpha
import Demo from './components/Demo';

const RouterComp = () => (
  <BrowserRouter>
    <Switch>
      {/* this is a route for testing layout and should be removed after alpha */}
      <Route path="/demo" exact component={Demo} />
      <PrivateRoute path="/" exact component={Projects} />
      <Route path="/login" exact component={Login} />
      <Route path="/index.html" exact component={Login} />
      <Route path="/register" exact component={RegisterView} />
      <Route path="/error-page" exact component={ErrorPage} />

      <PrivateRoute path="/perms/owner" owneronly exact component={Projects} />
      <PrivateRoute path="/perms/role" minRole={20} exact component={Projects} />
      <PrivateRoute path="/perms/account" accountType={1} exact component={Projects} />

      <PrivateRoute path="/my-projects/:projectId/settings" exact component={SettingsView} />
      <PrivateRoute path="/my-projects" exact component={Projects} />
      <PrivateRoute exact path="/new-group" component={CreateGroup} />
      <PrivateRoute exact path="/profile" component={UserAccount} />
      <PrivateRoute path="/:user" exact component={UserProfile} />
      <PrivateRoute path="/new-project/classification/:classification" exact component={CreateProject} />
      <PrivateRoute path="/my-projects/:projectId/:branch/commits/:pathParam?" exact component={Commits} />
      <PrivateRoute
        path="/my-projects/:projectId/insights/-/jobs/:logId"
        component={Insights}
      />
      <PrivateRoute
        path="/my-projects/:projectId/insights/-/jobs"
        exact
        component={Insights}
      />
      <PrivateRoute
        exact
        path="/my-projects/:projectId/upload-file"
        component={UploadFile}
      />
      <PrivateRoute
        exact
        path="/my-projects/:projectId/:branch/upload-file"
        component={UploadFile}
      />
      <PrivateRoute
        exact
        path="/my-projects/:projectId"
        component={projectView}
      />
      <PrivateRoute
        exact
        path="/my-projects/:projectId/new-branch"
        component={NewBranch}
      />
      <PrivateRoute
        exact
        path="/my-projects/:projectId/branches"
        component={BranchesView}
      />
      <PrivateRoute exact path="/my-projects/:projectId/pipe-line" component={PipeLineView} />
      <PrivateRoute path="/my-projects/:projectId/empty-data-visualization" component={EmptyDataVisualization} />
      <PrivateRoute path="/my-projects/:projectId/visualizations/:visName/path/:path" component={DataVisualizationDetail} />
      <PrivateRoute path="/my-projects/:projectId/visualizations/:visName" component={DataVisualizationDetail} />
      <PrivateRoute path="/my-projects/:projectId/visualizations" component={DataVisualizationOverview} />
      <PrivateRoute exact path="/my-projects/:projectId/-/datasets" component={DataInstanceOverview} />
      <PrivateRoute path="/my-projects/:projectId/:branch/-/datasets/:dataId/path/:path" component={DataInstanceDetails} />
      <PrivateRoute path="/my-projects/:projectId/:branch/-/datasets/:dataId" component={DataInstanceDetails} />
      <PrivateRoute path="/my-projects/:projectId/new-experiment" component={NewExperiment} />
      <PrivateRoute path="/my-projects/:projectId/fork" component={ForkView} />
      <PrivateRoute
        path="/my-projects/:projectId/-/experiments"
        exact
        component={ExperimentsOverview}
      />
      <PrivateRoute path="/my-projects/:projectId/-/experiments/:experimentId" exact component={ExperimentDetails} />
      <PrivateRoute path="/my-projects/:projectId/:branch" exact component={projectView} />
      <PrivateRoute
        path="/my-projects/:projectId/:branch/blob/:file"
        component={FileView}
      />
      <PrivateRoute path="/my-projects/:projectId/:branch/path/:path" component={projectView} />
      <PrivateRoute path="/my-projects/:projectId/commit/:commitId" exact component={CommitDetails} />
      <PrivateRoute
        exact
        path="/my-projects/:projectId/merge-requests/overview"
        component={mergeRequestOverview}
      />
      <PrivateRoute
        exact
        path="/my-projects/:projectId/merge-requests/:iid"
        component={BasicMergeRequestView}
      />
      <PrivateRoute
        exact
        path="/my-projects/:projectId/:branch/new-merge-request"
        component={NewMergeRequest}
      />
      <Route component={ErrorPage} />
    </Switch>
  </BrowserRouter>
);

export default RouterComp;

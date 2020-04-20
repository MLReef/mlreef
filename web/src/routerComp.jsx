import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './css/globalStyles.css';
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
import NewProject from './components/new-project/newProject';
import NewMergeRequest from './components/new-merge-request/newMergeRequest';
import NewBranch from './components/newBranch';
import BranchesView from './components/branches-list-view/branchesView';
import mergeRequestOverview from './components/new-merge-request/merge-request-overview';
import BasicMergeRequestView from './components/mergeRequestDetailView/basicMergeRequestView';
import DataVisualizationDetail from './components/data-visualization/dataVisualizationDetail';
import Insights from './components/insights/insights';
// this is component for testing layout and should be removed after alpha
import Demo from './components/Demo';

const RouterComp = () => (
  <BrowserRouter>
    <Switch>
      {/* this is a route for testing layout and should be removed after alpha */}
      <Route path="/demo" exact component={Demo} />

      <Route path="/" exact component={Login} />
      <Route path="/index.html" exact component={Login} />
      <Route path="/register" exact component={RegisterView} />
      <Route path="/error-page" exact component={ErrorPage} />
      <PrivateRoute path="/my-projects" exact component={Projects} />
      <PrivateRoute path="/new-project/classification/:classification" exact component={NewProject} />
      <PrivateRoute path="/my-projects/:projectId/:branch/commits/:pathParam?" exact component={Commits} />
      <PrivateRoute
        path="/my-projects/:projectId/insights"
        component={Insights}
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
      <PrivateRoute exact path="/my-projects/:projectId/:branch/data-instances" component={DataInstanceOverview} />
      <PrivateRoute path="/my-projects/:projectId/:branch/data-instances/:di_name/path/:path" component={DataInstanceDetails} />
      <PrivateRoute path="/my-projects/:projectId/:branch/data-instances/:di_name" component={DataInstanceDetails} />
      <PrivateRoute path="/my-projects/:projectId/new-experiment" component={NewExperiment} />
      <PrivateRoute
        path="/my-projects/:projectId/experiments-overview"
        exact
        component={ExperimentsOverview}
      />
      <PrivateRoute path="/my-projects/:projectId/experiment-details/:experimentId" exact component={ExperimentDetails} />
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

import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./css/globalStyles.css";
import FileView from "./components/fileView/fileView";
import Login from "./components/login/login";
import projectView from "./components/projectView/projectView";
import PipeLineView from "./components/pipeline-view/pipelineView";
import PrivateRoute from "./privateRoute";
import ExperimentsOverview from "./components/experiments-overview/experimentsOverview";
import Projects from "./components/myProjects/myProjects";
import Commits from "./components/commits-view/commitsView";
import CommitDetails from "./components/commits-details/commitDetails";
import NewExperiment from "./components/newExperiment";
import DataInstanceOverview from "./components/data-instance/dataInstanceOverview";
import DataInstanceDetails from "./components/data-instance/dataInstanceDetails";
import EmptyDataVisualization from "./components/data-visualization/dataVisualization";

const RouterComp = () => (
    <BrowserRouter>
        <Switch>
            <Route path="/" exact component={Login} />
            <Route path="/index.html" exact component={Login} />
            <PrivateRoute path="/my-projects" exact component={Projects} />
            <PrivateRoute path="/my-projects/:projectId/:branch/commits" exact component={Commits} />
            <PrivateRoute exact path="/my-projects/:projectId/pipe-line" component={PipeLineView} />
            <PrivateRoute path="/my-projects/:projectId/visualizations" component={EmptyDataVisualization} />
            <PrivateRoute exact path="/my-projects/:projectId/:branch/data-instances" component={DataInstanceOverview} />
            <PrivateRoute path="/my-projects/:projectId/:branch/data-instances/:di_name" component={DataInstanceDetails} />
            <PrivateRoute path="/my-projects/:projectId/new-experiment" component={NewExperiment} />
            <PrivateRoute
                path="/my-projects/:projectId/experiments-overview"
                exact
                component={ExperimentsOverview}
            />
            <PrivateRoute path="/my-projects/:projectId/:branch" exact component={projectView} />
            <PrivateRoute
                path="/my-projects/:projectId/files/branch/:branch/file-name/:file"
                component={FileView}
            />
            <PrivateRoute path="/my-projects/:projectId/files/branch/:branch" component={projectView} />
            <PrivateRoute path="/my-projects/:projectId/commit/:id" exact component={CommitDetails} />
        </Switch>
    </BrowserRouter>
);

export default RouterComp;
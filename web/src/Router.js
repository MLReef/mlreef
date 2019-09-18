import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./css/global-styles.css";
import FileView from "./components/file-view";
import Login from "./components/login/login";
import projectView from "./components/projectView";
import PipeLineView from "./components/pipeline-view/pipeline-view";
import PrivateRoute from "./private-route";
import ExperimentsOverview from "./components/experiments-overview";
import Projects from "./components/my-projects";
import Commits from "./components/commits-view/commitsView";
import CommitDetails from "./components/commits-details/commitDetails";

const RouterComp = () => (
    <BrowserRouter>
        <Switch>
            <Route path="/" exact component={Login} />
            <Route path="/index.html" exact component={Login} />
            <PrivateRoute path="/my-projects" exact component={Projects} />
            <PrivateRoute path="/my-projects/:projectId" exact component={projectView} />
            <PrivateRoute
                path="/my-projects/:projectId/experiments-overview"
                component={ExperimentsOverview}
            />
            <PrivateRoute
                path="/my-projects/:projectId/files/branch/:branch/file-name/:file"
                component={FileView}
            />
            <PrivateRoute path="/my-projects/:projectId/files/branch/:branch" component={projectView} />
            <PrivateRoute path="/my-projects/:projectId/pipe-line" component={PipeLineView} />
            <PrivateRoute path="/my-projects/:projectId/commits" exact component={Commits} />
            <PrivateRoute path="/my-projects/:projectId/commit/:id" exact component={CommitDetails} />
        </Switch>
    </BrowserRouter>   
);

export default RouterComp;
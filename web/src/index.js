import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./css/global-styles.css";
import configureStore from "./store";
import { Provider } from "react-redux";
import { getProjectsList } from "./actions/projectInfoActions";
import FileView from "./components/file-view";
import Login from "./components/login/login";
import projectView from "./components/projectView";
import PipeLineView from "./components/pipeline-view/pipeline-view";
import PrivateRoute from "./private-route";
import ExperimentsOverview from "./components/experiments-overview";
import MyProjects from "./components/my-projects";

const store = configureStore();
store.dispatch(getProjectsList());

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Login} />
        <Route path="/index.html" exact component={Login} />
        <PrivateRoute path="/my-projects" exact component={MyProjects} />
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
      </Switch>
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);

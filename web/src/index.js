import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./css/global-styles.css";
import configureStore from "./store";
import { Provider } from "react-redux";
import { loadProjectGeneralInfo } from "./actions/projectInfoActions";
import App from "./App";
import FileView from "./components/file-view";
import Login from "./components/login/login";
import projectView from "./components/projectView";
import PipeLineView from "./components/pipe-line-view";
import PrivateRoute from "./private-route";
import ExperimentsOverview from "./components/experiments-overview";
import Projects from "./components/my-projects";

const store = configureStore();
store.dispatch(loadProjectGeneralInfo());

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Login} />
        <Route path="/index.html" exact component={Login} />
        <PrivateRoute path="/home" component={App} />
        <PrivateRoute
          path="/files/branch/:branch/file-name/:file"
          component={FileView}
        />
        <PrivateRoute path="/files/branch/:branch" component={projectView} />
        <PrivateRoute
          path="/experiments-overview"
          component={ExperimentsOverview}
        />
        <PrivateRoute path="/my-projects" component={Projects} />
        <PrivateRoute path="/pipe-line" component={PipeLineView} />
      </Switch>
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);

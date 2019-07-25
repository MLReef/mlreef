import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import "./css/index.css";
import configureStore from './store';
import {Provider} from 'react-redux';
import {loadProjectGeneralInfo} from './actions/projectInfoActions';
import App from './App';
import FileView from './components/file-view';
import Login from './components/login';
import projectView from './components/projectView';
//import PrivateRoute from './private-route';

const store = configureStore();
store.dispatch(loadProjectGeneralInfo());

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <Switch>
                <Route path="/" exact component={Login}/>
                <Route path="/index.html" exact component={Login}/>
                <Route path="/home" exact component={App}/>
                <Route path="/branch/:branch/file-name/:file" exact component={FileView}/>
                <Route path="/files/branch/:branch/path/:path" exact component={projectView}/>
           </Switch>
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);

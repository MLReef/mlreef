import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Redirect, Route, Switch} from 'react-router-dom'
import "./css/index.css";
import configureStore from './store';
import {Provider} from 'react-redux';
import {loadProjectGeneralInfo} from './actions/projectInfoActions';
import App from './App';
import FileView from './components/file-view';
import projectView from './components/projectView';

const store = configureStore();
store.dispatch(loadProjectGeneralInfo());

ReactDOM.render(
    <Provider store={store}>
        <BrowserRouter>
            <Redirect from="/" to="/home"/>
            <Switch>
                <Route path="/home" component={App}/>
                <Route path="/files/branch/:branch/file-name/:file" exact component={FileView}/>
                <Route path="/files/branch/:branch/path/:path" component={projectView}/>
            </Switch>
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);

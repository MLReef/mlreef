import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'
import registerServiceWorker from './registerServiceWorker';
import "./css/index.css";
import configureStore from './store';
import { Provider } from 'react-redux';
import { loadFiles } from './actions/fileActions';

const store = configureStore();
store.dispatch(loadFiles());

ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    document.getElementById('root')
);
registerServiceWorker();

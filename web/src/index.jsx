import React from 'react';
import ReactDOM from 'react-dom';
import 'reflect-metadata';
import './styles/theme.scss';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import MActionModal from 'components/layout/MActionModal';
import Tutorial from 'components/commons/Tutorial';
import { persistStore } from 'redux-persist';
import { Helmet } from 'react-helmet';
import Router from 'router';
import store from 'store';
import routes from './routes';
import ToastMessage from './components/toast/toast';
import ErrorHandler from './ErrorHandler';
import checkVersion from './functions/helpers';
import 'whatwg-fetch';

// monaco-editor is needed to language highlighting
React.lazy(() => import('monaco-editor'));

checkVersion();

const persistor = persistStore(store);

ReactDOM.render(
  <Provider store={store}>
    <ErrorHandler>
      <ToastMessage />
      <MActionModal />
      <PersistGate
        loading={(
          <div>
            <h1>
              Loading...
            </h1>
          </div>
        )}
        persistor={persistor}
      >
        <Helmet>
          <title>MLReef</title>
        </Helmet>
        <div className="main-container mb-5">
          <Router routes={routes}>
            <Tutorial />
          </Router>
        </div>
      </PersistGate>
    </ErrorHandler>
  </Provider>,
  document.getElementById('root'),
);

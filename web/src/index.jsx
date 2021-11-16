import React from 'react';
import ReactDOM from 'react-dom';
import 'reflect-metadata';
import './styles/theme.scss';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Worker } from '@react-pdf-viewer/core';
import MActionModal from 'components/layout/MActionModal';
import Tutorial from 'components/commons/Tutorial';
import { persistStore } from 'redux-persist';
import { Helmet } from 'react-helmet';
import Router from 'router';
import store from 'store';
import { version } from '../package.json';
import routes from './routes';
import ToastMessage from './components/toast/toast';
import ErrorHandler from './ErrorHandler';
import 'whatwg-fetch';

const persistor = persistStore(store);

// eslint-disable-next-line
console.info(`Current version: ${version}`);

ReactDOM.render(
<Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.3.200/pdf.worker.js">
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
  </Provider>
  </Worker>,
  document.getElementById('root'),
);

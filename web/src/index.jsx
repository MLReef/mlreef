import React from 'react';
import ReactDOM from 'react-dom';
import 'reflect-metadata';
import './css/globalStyles.css';
import './styles/theme.scss';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import MActionModal from 'components/layout/MActionModal';
import { persistStore } from 'redux-persist';
import { Helmet } from 'react-helmet';
import Router from 'router';
import routes from './routes';
import store from './store';
import ToastMessage from './components/toast/toast';
import ErrorHandler from './ErrorHandler';
import checkVersion from './functions/helpers';
import 'whatwg-fetch';

// monaco-editor is needed to language highlighting
React.lazy(() => import('monaco-editor'));

checkVersion();

const persistor = persistStore(store);

ReactDOM.render(
  <ErrorHandler>
    <Provider store={store}>
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
          <Router routes={routes} />
        </div>
      </PersistGate>
    </Provider>
  </ErrorHandler>,
  document.getElementById('root'),
);

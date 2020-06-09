import React from 'react';
import ReactDOM from 'react-dom';
import 'reflect-metadata';
import './css/globalStyles.css';
import './styles/theme.scss';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import MActionModal from 'components/layout/MActionModal';
import { persistStore } from 'redux-persist';
import store from './store';
import RouterComp from './routerComp';
import ToastMessage from './components/toast/toast';
import ErrorHandler from './ErrorHandler';
import checkVersion from './functions/helpers';
import 'whatwg-fetch';

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
        <div className="main-container mb-5">
          <RouterComp store={store} />
        </div>
      </PersistGate>
    </Provider>
  </ErrorHandler>,
  document.getElementById('root'),
);

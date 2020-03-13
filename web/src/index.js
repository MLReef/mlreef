import React from 'react';
import ReactDOM from 'react-dom';
import './css/globalStyles.css';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';
import store from './store';
import RouterComp from './routerComp';
import ToastMessage from './components/toast/toast';
import ErrorHandler from "./ErrorHandler";
import { checkVersion } from './functions/helpers';

checkVersion();

const persistor = persistStore(store);

ReactDOM.render(
  <ErrorHandler>
    <Provider store={store}>
      <ToastMessage />
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
        <RouterComp store={store} />
      </PersistGate>
    </Provider>
  </ErrorHandler>,
  document.getElementById('root'),
);

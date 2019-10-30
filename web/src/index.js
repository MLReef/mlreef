import React from 'react';
import ReactDOM from 'react-dom';
import './css/globalStyles.css';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import initialState from './reducers/initialState';
import rootReducer from './reducers/index';
import { getProjectsList } from './actions/projectInfoActions';
import RouterComp from './routerComp';
import ToastMessage from './components/toast/toast';

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = createStore(persistedReducer, initialState, applyMiddleware(thunk));
const persistor = persistStore(store);

store.dispatch(getProjectsList());

ReactDOM.render(
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
  </Provider>,
  document.getElementById('root'),
);

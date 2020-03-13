import { createStore, applyMiddleware } from 'redux';
import { persistReducer } from 'redux-persist';
import thunk from 'redux-thunk';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import rootReducer from './reducers/index';
import initialState from './reducers/initialState';

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = createStore(persistedReducer, initialState, applyMiddleware(thunk));

export default store;

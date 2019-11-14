import { createStore, applyMiddleware } from 'redux';

import rootReducer from '../reducers/index';
import { middlewares } from '../configureStore';

// eslint-disable-next-line import/prefer-default-export
export const storeFactory = (initialState) => {
  const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
  return createStoreWithMiddleware(rootReducer, initialState);
};

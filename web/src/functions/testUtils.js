/* eslint-disable no-undef */
import checkPropTypes from 'check-prop-types';
import { createStore, applyMiddleware } from 'redux';

import { middlewares } from 'store/configureStore';
import rootReducer from 'store/reducers/index';

export const findByTestAttr = (wrapper, attrName, val) => wrapper.find(`[${attrName}="${val}"]`);

export const checkProps = (component, conformingProps) => {
  const propError = checkPropTypes(
    component.propTypes,
    conformingProps,
    'prop',
    component.name,
  );
  expect(propError).toBeUndefined();
};

export const storeFactory = (initialState) => {
  const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
  return createStoreWithMiddleware(rootReducer, initialState);
};

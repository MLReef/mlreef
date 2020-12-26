/* eslint-disable no-unused-vars */
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import waitForExpect from 'wait-for-expect';

import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'babel-polyfill';
import 'whatwg-fetch';

waitForExpect.defaults.timeout = 200000;
waitForExpect.defaults.interval = 10000;

configure({ adapter: new Adapter() });
jest.setTimeout(300000);

export const TestHook = ({ callback }) => {
  callback();
  return null;
};

export const testHook = (hook, options) => {
  const {
    store,
  } = options;

  return mount(
    <Provider store={store}>
      <TestHook callback={hook} />
    </Provider>,
  );
};

export const testHookWithRoute = (hook, options) => {
  const {
    store,
    url,
  } = options;

  return mount(
    <Provider store={store}>
      <MemoryRouter initialEntries={[url]}>
        <TestHook callback={hook} />
      </MemoryRouter>
    </Provider>,
  );
};

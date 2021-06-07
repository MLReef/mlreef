import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import waitForExpect from 'wait-for-expect';
import hooks from 'customHooks/useSelectedProject';

import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'babel-polyfill';
import 'whatwg-fetch';
import { projectsArrayMock } from 'testData';

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

// Overwrite hook in order to make tests compile

hooks.useSelectedProject = jest.fn(() => [projectsArrayMock.projects.selectedProject, false]);

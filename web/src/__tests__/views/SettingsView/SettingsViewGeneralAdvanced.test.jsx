import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { storeFactory } from 'functions/testUtils';
import SettingsViewGeneralAdvanced from 'components/views/SettingsView/SettingsViewGeneralAdvanced';

describe('basic behaviour', () => {
  let wrapper;
  let store;
  const getActionModalIsShown = () => store.getState().actionModal.isShown;

  beforeEach(() => {
    store = storeFactory({});

    wrapper = mount(
      <Provider store={store}>
        <SettingsViewGeneralAdvanced
          id="project-id"
          name="Project Name"
        />
      </Provider>,
    );
  });

  test('assert that modal is not shown', () => {
    expect(getActionModalIsShown()).toBe(false);
  });

  test('assert that when click on button fire modal', () => {
    wrapper.find('button').simulate('click');

    expect(getActionModalIsShown()).toBe(true);
  });
});

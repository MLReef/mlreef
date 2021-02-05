import React from 'react';
import { mount } from 'enzyme';
import SettingsView from 'components/views/SettingsView';
import { storeFactory } from 'functions/testUtils';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

const setup = () => {
  const match = {
    params: { branch: 'master' },
  };
  const location = { state: { currentFilePath: '' } };
  const store = storeFactory({
    projects: {
      selectedProject: {
        backendId: 'anything',
        ownerId: 'anything-else',
        defaultBranch: 'master',
        gid: 18,
        gitlab: {
          namespace: {
            kind: 'user',
          },
        },
      },
    },
  });
  const wrapper = mount(
    <MemoryRouter>
      <Provider store={store}>
        <SettingsView match={match} location={location} store={store} history={{ push: jest.fn() }} />,
      </Provider>
    </MemoryRouter>,
  );
  return wrapper;
};

describe('SettingsView basics', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = setup();
  });

  test('assert render', () => {
    expect(wrapper.find('.settings-view-content')).toHaveLength(1);
  });
});

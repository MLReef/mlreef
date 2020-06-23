import React from 'react';
import { shallow } from 'enzyme';
import SettingsView from 'components/views/SettingsView';
import { storeFactory } from 'functions/testUtils';

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
      },
    },
  });
  const wrapper = shallow(
    <SettingsView match={match} location={location} store={store} history={{ push: jest.fn() }} />,
  );
  const afterDive = wrapper.dive().dive();
  return afterDive;
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

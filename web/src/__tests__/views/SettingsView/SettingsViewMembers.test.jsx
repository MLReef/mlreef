import React from 'react';
import { shallow } from 'enzyme';
import SettingsViewMembers from 'components/views/SettingsView/SettingsViewMembers';

describe('SettingsViewMembers basics', () => {
  const wrapper = shallow(
    <SettingsViewMembers
      projectId="anything"
      ownerId="anything-else"
    />,
  );

  test('assert render', () => {
    expect(wrapper.find('.settings-view-members')).toHaveLength(1);
  });
});

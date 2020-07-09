/* eslint-disable no-undef */
import React from 'react';
import { shallow } from 'enzyme';
import MDropdown from 'components/ui/MDropdown';
import { avatarUrl } from 'testData';
import { FileView } from '../components/fileView/fileView';
import { branchesMock, mockMatchDataCommitDet, projectsArrayMock } from '../testData';

const wrapper = shallow(
  <FileView
    branches={branchesMock}
    match={mockMatchDataCommitDet}
    projects={projectsArrayMock.projects}
    users={projectsArrayMock.users}
  />,
);

describe('check for file view elements', () => {
  test('that an avatar is rendered', () => {
    expect(wrapper.find('.avatar-circle').prop('src')).toEqual(avatarUrl);
  });

  test('that three file manipulation buttons are rendered', () => {
    expect(wrapper.find('.file-actions').children()).toHaveLength(3);
  });

  test('that dropdown appears on button click', () => {
    wrapper
      .find(MDropdown)
      .first()
      .dive()
      .find('.m-dropdown-button button')
      .simulate('click');

    expect(
      wrapper
        .find(MDropdown)
        .first()
        .dive()
        .find('.m-dropdown-list-container'),
    ).toHaveLength(1);
  });
});

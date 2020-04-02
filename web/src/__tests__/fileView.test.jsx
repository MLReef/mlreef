/* eslint-disable no-undef */
import React from 'react';
import { shallow } from 'enzyme';
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

describe('Check for an avatar as the page renders', () => {
  it('should render an avatar', () => {
    wrapper.find('div.commit-pic-circle').find('img').prop('src');
  });
});

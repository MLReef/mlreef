import React from 'react';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { storeFactory } from 'functions/testUtils';
import FileView from 'components/FileviewComp/Fileview';
import functions from 'components/FileviewComp/functions';
import {
  branchesMock, mockedFileDetails, commitMockObject,
} from '../../../testData';

const setup = () => mount(
  <Provider store={storeFactory({ branches: branchesMock })}>
    <MemoryRouter>
      <FileView
        branches={branchesMock}
        match={{
          params: {
            namespace: 'namespace-1',
            slug: 'project-1',
          },
        }}
      />
    </MemoryRouter>
  </Provider>,
);

describe('check for file view elements', () => {
  let wrapper;
  beforeEach(() => {
    functions.getFileAndInformation = jest.fn(() => new Promise((resolve) => resolve({
      fData: mockedFileDetails,
      commitInfoDet: commitMockObject,
    })));
    wrapper = setup();
  });

  test('assert that file data is mapped to the container', () => {
    wrapper.setProps({});
    expect(wrapper.find('img.file-img').props().src.includes(mockedFileDetails.content)).toBe(true);
  });

  test('that dropdown appears on button click', () => {
    wrapper.setProps({});
    wrapper.find('.fileview-branch-path .m-dropdown-button button').simulate('click');
    expect(wrapper.find('.fileview-branch-path .m-dropdown-button button').hasClass('active')).toBe(true);
  });
});

import React from 'react';
import { shallow } from 'enzyme';
import UploadFile from 'components/views/uploadFile/uploadFile';
import { projectsArrayMock } from 'testData';
import { storeFactory } from 'functions/testUtils';
import 'babel-polyfill';

const setup = () => {
  const match = {
    params: { branch: 'master' },
  };
  const location = { state: { currentFilePath: '' } };
  const store = storeFactory({
    projects: {
      selectedProject: projectsArrayMock.projects.selectedProject,
    }
  });
  const wrapper = shallow(
    <UploadFile match={match} location={location} store={store} history={{ push: jest.fn() }} />,
  );
  const afterDive = wrapper.dive().dive();
  return afterDive;
};

describe('presence of elements and functions', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that file input is present and has the right props', () => {
    const fileInput = wrapper.find('[type="file"]');
    expect(fileInput).toHaveLength(1);
    const fileInputProps = fileInput.first().props();
    expect(fileInputProps.accept).toBe('*');
    expect(fileInputProps.multiple).toBe(true);
  });

  test('assert other elements are present in Dom', () => {
    expect(wrapper.find('textarea#commitMss-text-area')).toHaveLength(1);
    expect(wrapper.find('input#target-branch')).toHaveLength(1);
    expect(wrapper.find('MCheckBox')).toHaveLength(1);
    expect(wrapper.find('button#cancel-button')).toHaveLength(1);
    expect(wrapper.find('MButton')).toHaveLength(1);
  });

  test('assert that reducer is called when files are selected', () => {
    const mockFileName = 'a-file-to-test';
    const mockedFile = new File([''], mockFileName, { type: 'application/jpg' });
    const mockChangeEv = {
      target: {
        files: [mockedFile],
      },
    };
    wrapper.find('input.file-browser-input').simulate('change', mockChangeEv);
    const filesInTheDom = wrapper.find('FileToSend');
    expect(filesInTheDom).toHaveLength(1);
    expect(filesInTheDom.first().props().fileName).toBe(mockFileName);
  });
});

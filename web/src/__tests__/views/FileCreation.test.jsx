import React from 'react';
import { shallow } from 'enzyme';
import FileCreation from 'components/views/FileCreation';
import actions from 'components/views/FileCreation/actions';
import { storeFactory } from 'functions/testUtils';
import { projectsArrayMock } from 'testData';
import fileCreationConstants from 'components/views/FileCreation/fileCreationConstants';

const store = storeFactory({ projects: projectsArrayMock.projects });

const mockedBranch = 'master';

const mockedPath = 'data';

const push = jest.fn();

const mockedNamespace = 'some-namespace';

const mockedSlug = 'some-slug';

const setup = () => shallow(
  <FileCreation
    match={{
      params: {
        namespace: mockedNamespace,
        slug: mockedSlug,
        branch: mockedBranch,
        path: mockedPath,
      },
    }}
    history={{ push }}
    store={store}
  />,
).dive().dive();

describe('test HTML presence and functionality', () => {
  let wrapper;
  beforeEach(() => {
    actions.createFile = jest.fn(() => new Promise((resolve) => resolve('')));
    wrapper = setup();
  });

  test('assert that elements are present', () => {
    expect(wrapper.find('MBreadcrumb')).toHaveLength(1);
    expect(wrapper.find('h3').text()).toBe('New File');
    expect(wrapper.find('.file-creation-container-options-branch').text().trim()).toBe(mockedBranch);
    expect(wrapper.find('.file-creation-container-options-path').text().trim()).toBe(`${mockedPath}/`);
    expect(wrapper.find('input[name="name-input"]')).toHaveLength(1);
    expect(wrapper.find('MCodeRenderer')).toHaveLength(1);
    expect(wrapper.find('textarea[name="commit-message"]')).toHaveLength(1);
    expect(wrapper.find('input[name="target-branch"]')).toHaveLength(1);
    const buttons = wrapper.find('button');
    expect(buttons).toHaveLength(2);

    expect(buttons.at(0).text()).toBe('Cancel');
    expect(buttons.at(1).text()).toBe('Create');
  });

  test('assert that file name is validated correctly', () => {
    let mockedName = '';
    expect(wrapper.find('button').at(1).props().disabled).toBe(true);
    wrapper.find('input[name="name-input"]').simulate('change', { target: { value: mockedName } });

    mockedName = 'mocked name';
    wrapper.find('input[name="name-input"]').simulate('change', { target: { value: mockedName } });
    expect(wrapper.find('button').at(1).props().disabled).toBe(true);

    mockedName = '[mockedname]';
    wrapper.find('input[name="name-input"]').simulate('change', { target: { value: mockedName } });
    expect(wrapper.find('button').at(1).props().disabled).toBe(true);

    mockedName = 'mockedName.js';
    wrapper.find('input[name="name-input"]').simulate('change', { target: { value: mockedName } });
    expect(wrapper.find('button').at(1).props().disabled).toBe(false);
  });

  test('assert that cancel button redirects to project view', () => {
    wrapper.find('button').at(0).simulate('click');

    expect(push).toHaveBeenCalledWith(`/${mockedNamespace}/${mockedSlug}`);
  });

  test('assert that file creation has the correct file name', () => {
    const today = new Date();
    const value = 'data_processor.py';
    const valueContent = 'Some content to test';
    const mockedContent = { target: { value: valueContent } };
    const mockedBranchValue = `${mockedBranch}-patch-${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}-1`;
    wrapper.find('input[name="name-input"]').simulate('change', { target: { value } });
    wrapper
      .find('MSimpleSelect')
      .dive()
      .find('select')
      .simulate('change', { currentTarget: { value: 'dataProcessor' } });
    wrapper.find('textarea[name="commit-message"]').simulate('change', mockedContent);
    wrapper.find('input[name="target-branch"]').simulate('change', { target: { value: mockedBranchValue } });
    wrapper.find('MCheckBox').dive().find('div').simulate('click');

    wrapper.find('button').at(1).simulate('click');

    expect(actions.createFile).toHaveBeenCalledWith(
      projectsArrayMock.projects.selectedProject.gid,
      `${mockedBranch}-patch-${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}-1`,
      mockedPath,
      value,
      valueContent,
      fileCreationConstants.dataProcessor.content,
      mockedBranch,
      true,
    );
  });
});

import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { shallow } from 'enzyme';
import FileEditor from 'components/views/FileEditor';
import actions from 'components/views/FileEditor/actions';
import { storeFactory } from 'functions/testUtils';
import { projectsArrayMock } from 'testData';

const store = storeFactory({});

const mockedBranch = 'master';

const mockedPath = encodeURIComponent('data/someTestingFile.js');

const push = jest.fn();

const mockedNamespace = 'some-namespace';

const mockedSlug = 'some-slug';

const setup = () => shallow(
  <FileEditor
    match={{
      params: {
        namespace: mockedNamespace,
        slug: mockedSlug,
        branch: mockedBranch,
        path: mockedPath,
        action: 'edit',
      },
    }}
    history={{ push }}
    store={store}
  />,
);

describe('test HTML presence and functionality', () => {
  let wrapper;
  beforeEach(() => {
    actions.editFileAction = jest.fn(() => new Promise((resolve) => resolve('')));
    wrapper = setup();
  });

  test('assert that elements are present and render accordingly to the action', () => {
    expect(wrapper.find('input')).toHaveLength(1);
    expect(wrapper.find('p.file-creation-container-options-branch').text()).toBe(`${mockedBranch} `);
    expect(wrapper.find('p.file-creation-container-options-path').text()).toBe(decodeURIComponent(mockedPath));
  });

  test('assert that merge requests are enabled only for a branch different than the source one', () => {
    wrapper.find('input[name="target-branch"]').simulate('change', { target: { value: mockedBranch } });
    expect(wrapper.find('MCheckBox')).toHaveLength(0);
  });

  test('assert that the correct function is called after click', () => {
    const today = new Date();
    const valueContent = 'Some content to test';
    const mockedContent = { target: { value: valueContent } };
    const mockedBranchValue = `${mockedBranch}-patch-${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}-1`;

    wrapper.find('textarea[name="commit-message"]').simulate('change', mockedContent);
    wrapper.find('input[name="target-branch"]').simulate('change', { target: { value: mockedBranchValue } });
    wrapper.find('MCheckBox').dive().find('div').simulate('click');

    wrapper.find('button[name="submit-file"]').simulate('click');
    expect(actions.editFileAction).toHaveBeenCalledWith(
      projectsArrayMock.projects.selectedProject.gid,
      `${mockedBranch}-patch-${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}-1`,
      decodeURIComponent(mockedPath),
      valueContent,
      '',
      mockedBranch,
      true,
    );
  });
});

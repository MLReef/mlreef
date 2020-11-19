import React from 'react';
import { mount, shallow } from 'enzyme';
import SelectEntryPoint from 'components/views/PublishingView/SelectEntryPoint/SelectEntryPoint';
import { branchesMock, filesMock } from 'testData';

let dispatch;

const selectedBranch = 'master';

const setup = () => mount(
  <SelectEntryPoint
    entryPointFile={null}
    files={filesMock}
    branches={branchesMock}
    selectedBranch={selectedBranch}
    dispatch={() => {}}
    path="path"
    namespace="namespace"
    slug="slug"
  />,
);

const setupShallow = () => {
  dispatch = jest.fn();
  return shallow(
    <SelectEntryPoint
      entryPointFile={null}
      files={filesMock}
      branches={branchesMock}
      selectedBranch={selectedBranch}
      dispatch={dispatch}
      namespace="namespace"
      slug="slug"
    />,
  );
};

describe('html elements presence', () => {
  let wrapper;
  test('test elements presence', () => {
    wrapper = setup();
    expect(wrapper.find('MFileExplorer')).toHaveLength(1);
    expect(wrapper.find('div.search-branch')).toHaveLength(1);
    expect(wrapper.find('ul.m-file-explorer-files-list')).toHaveLength(1);
    const continueBtn = wrapper.find('button.btn.btn-dark');
    expect(continueBtn).toHaveLength(1);
    const branchAndScriptInfo = wrapper.find('strong.parameter-value');
    expect(branchAndScriptInfo).toHaveLength(2);
    expect(branchAndScriptInfo.at(1).text()).toBe(selectedBranch);
    expect(continueBtn.text()).toBe('Continue');
  });
});

describe('test functionality', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setupShallow();
  });
  test('assert that branch dropdown calls dispatch', () => {
    wrapper.find('MFileExplorer')
      .dive()
      .find('MBranchSelector')
      .dive()
      .find('MDropdown')
      .dive()
      .find('li')
      .at(0)
      .simulate('click');
    expect(dispatch.mock.calls[0]).toEqual([{ type: 'SET_SELECTED_BRANCH', payload: branchesMock[0].name }]);
    expect(dispatch.mock.calls[1]).toEqual([{ type: 'SET_ENTRY_POINT', payload: null }]);
    expect(dispatch.mock.calls[2]).toEqual([{ type: 'SET_FILES', payload: [] }]);
  });

  test('assert that a files table click triggers dispatch', () => {
    wrapper.find('MFileExplorer')
      .dive()
      .find('MCheckBox')
      .at(3)
      .dive()
      .find('div')
      .simulate('click');
    expect(dispatch.mock.calls[0]).toEqual([{ type: 'SET_ENTRY_POINT', payload: filesMock[3] }]);
  });

  afterEach(() => {
    dispatch.mockClear();
  });
});

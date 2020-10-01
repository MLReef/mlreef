import React from 'react';
import { mount } from 'enzyme';
import SelectDataPipelineModal from 'components/views/PipelinesExecutionView/SelectDataPipelineModal/SelectDataPipelineModal';
import { projectsArrayMock, branchesMock, filesMock } from 'testData';
import { DataPipelinesContext } from 'components/views/PipelinesExecutionView/DataPipelineHooks/DataPipelinesProvider';
import { initialState } from 'components/views/PipelinesExecutionView/DataPipelineHooks/DataPipelinesReducer';
import { storeFactory } from 'functions/testUtils';

const isVisibleSelectFilesModal = true;
const dispatchMock = jest.fn();
const setup = (opt = {}) => {
  const mockUseReducer = [
    { ...initialState, ...opt, isVisibleSelectFilesModal },
    dispatchMock,
  ];
  const store = storeFactory({
    projects: projectsArrayMock.projects,
    branches: branchesMock,
    user: { preconfiguredOperations: null },
  });
  return mount(
    <DataPipelinesContext.Provider value={mockUseReducer}>
      <SelectDataPipelineModal store={store} testFiles={filesMock} />
    </DataPipelinesContext.Provider>,
  );
};

describe('html elements presence', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that wrapper contains and renders elements', () => {
    expect(wrapper.find('MDropdown')).toHaveLength(1);
    const acceptBtn = wrapper.find('#accept');
    expect(acceptBtn).toHaveLength(1);
    expect(acceptBtn.text()).toBe('Accept');
    expect(wrapper.find('table#file-tree')).toHaveLength(1);
  });
});

describe('test events in files table', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that selecting and disabling works', () => {
    wrapper.find('div.m-checkbox')
      .at(0)
      .simulate('click');
    const checkBoxesProps = wrapper.find('MCheckBox').map((node) => node.props());
    const disabledFiles = checkBoxesProps.filter((prop) => prop.disabled);
    const checkedFiles = checkBoxesProps.filter((f) => f.checked).length;
    expect(disabledFiles.length).toBe(filesMock.length - 1);
    expect(checkedFiles).toBe(1);
  });

/*   test('assert that clicking on a folder updates dom', () => {
    const mockUpdateFiles = jest.fn();
    wrapper.instance().updateFiles = mockUpdateFiles;
    wrapper.find('#button-for-0').simulate('click');
    expect(wrapper.state().filePath).toBe('directory_1');
    expect(wrapper.state().showReturnOption).toBe(true);
    const projectId = projectsArrayMock.projects.selectedProject.gid;
    const { branchSelected } = wrapper.state();
    const filePath = filesMock[0].path;
    expect(mockUpdateFiles).toHaveBeenCalledWith(projectId, filePath, branchSelected);
  }); */
  test('assert that handleAccept is called with the right arguments', () => {
    wrapper.find('button#accept').simulate('click');
    expect(dispatchMock).toHaveBeenCalled();
  });
});

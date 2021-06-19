import React from 'react';
import { mount } from 'enzyme';
import { 
  UnconnectedSelectDataPipelineModal 
} from 'components/views/PipelinesExecutionView/SelectDataPipelineModal/SelectDataPipelineModal';
import { projectsArrayMock, branchesMock, filesMock } from 'testData';
import { 
  DataPipelinesContext 
} from 'components/views/PipelinesExecutionView/DataPipelineHooks/DataPipelinesProvider';
import { 
  initialState 
} from 'components/views/PipelinesExecutionView/DataPipelineHooks/DataPipelinesReducerAndFunctions';
import { generatePromiseResponse, sleep } from 'functions/testUtils';
import { jobs } from './testData';
import { SUCCESS } from 'dataTypes';

const isVisibleSelectFilesModal = true;
let dispatchMock;
const setup = (initialFiles = []) => {
  dispatchMock = jest.fn();
  jest.spyOn(global, 'fetch').mockImplementation((req) => {
    if(req.url.includes('/repository/tree')) {
      return generatePromiseResponse(200, true, filesMock, 10);
    }

    return generatePromiseResponse(200, true, jobs, 10);
  });
  const mockUseReducer = [
    {
      ...initialState,
      isVisibleSelectFilesModal,
      initialInformation: {
        initialFiles,
      },
    },
    dispatchMock,
  ];
  return mount(
    <DataPipelinesContext.Provider value={mockUseReducer}>
      <UnconnectedSelectDataPipelineModal
        project={projectsArrayMock.projects.selectedProject}
        branches={branchesMock}
      />
    </DataPipelinesContext.Provider>,
  );
};

describe('html elements presence', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that jobs api is called', () => {
    expect(global.fetch.mock.calls.length).toBeGreaterThan(1);
    expect(global.fetch.mock.calls[1][0].url).toBe('/api/v4/projects/12395599/jobs');
  });

  test('assert that wrapper contains and renders elements as well as some events', async () => {
    await sleep(50);
    wrapper.setProps({});
    const dropDown = wrapper.find('MDropdown')
    expect(dropDown).toHaveLength(1);
    const acceptBtn = wrapper.find('#accept');
    expect(acceptBtn).toHaveLength(1);
    expect(acceptBtn.text()).toBe('Accept');
    expect(wrapper.find('table#file-tree')).toHaveLength(1);

    const dataSetOptions = dropDown.find('.datasets').find('ul');
    expect(dataSetOptions.children()).toHaveLength(2);

    dataSetOptions.children().forEach((liNode, ind) => {
      // the function to get index is required because array is reversed
      const currentJob = jobs[jobs.length - ind - 1]; 
      expect(liNode.childAt(0).text().includes(currentJob.name)).toBe(true);
      expect(liNode.childAt(0).props().disabled).toBe(currentJob.status !== SUCCESS);
    });

    wrapper.find('.modal-container-close').childAt(0).simulate('click');
    expect(dispatchMock)
      .toHaveBeenCalledWith({
        type: 'SET_IS_VISIBLE_FILES_MODAL',
        isVisibleSelectFilesModal: false,
      });
  });

  afterEach(() => {
    dispatchMock.mockClear();
  });
});

describe('pass initial files', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup(
      [{
        location: 'directory_1',
        location_type: 'PATH',
      }],
    );
  });
  test('assert that checkboxes show files selected', async () => {
    await sleep(50);
    wrapper.setProps({});
    const checkBoxesProps = wrapper.find('MCheckBox').map((node) => node.props());
    const disabledFiles = checkBoxesProps.filter((prop) => prop.disabled);
    const checkedFiles = checkBoxesProps.filter((f) => f.checked).length;
    expect(disabledFiles.length).toBe(filesMock.length - 1);
    expect(checkedFiles).toBe(1);
    wrapper.find('button#accept').simulate('click');
    expect(dispatchMock.mock.calls[3][0].filesSelectedInModal.length).toBe(1);
    expect(dispatchMock.mock.calls[4][0].branchSelected).toBe('master');
  });

  afterEach(() => {
    dispatchMock.mockClear();
  });
});

describe('test events in files table and correct submit', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that selecting and disabling works', async () => {
    await sleep(50);
    wrapper.setProps({});
    wrapper.find('div.m-checkbox')
      .at(0)
      .simulate('click');
    const checkBoxesProps = wrapper.find('MCheckBox').map((node) => node.props());
    const disabledFiles = checkBoxesProps.filter((prop) => prop.disabled);
    const checkedFiles = checkBoxesProps.filter((f) => f.checked).length;
    expect(disabledFiles.length).toBe(filesMock.length - 1);
    expect(checkedFiles).toBe(1);
  });

  test('assert that handleAccept is called with the right arguments', async () => {
    await sleep(50);
    wrapper.setProps({});
    wrapper.find('MDropdown').find('li').at(0).simulate('click');
    wrapper.find('div.m-checkbox')
      .at(0)
      .simulate('click');
    wrapper.find('button#accept').simulate('click');
    const { calls } = dispatchMock.mock;
    expect(calls[0]).toEqual([{ isVisibleSelectFilesModal: false, type: 'SET_IS_VISIBLE_FILES_MODAL' }]);
    expect(calls[1]).toEqual(
      [{
        filesSelectedInModal: [{
          ...filesMock[0],
          checked: true,
          disabled: false,
        }],
        type: 'UPDATE_FILES_SELECTED_IN_MODAL',
      }],
    );
    expect(calls[2]).toEqual([{ branchSelected: branchesMock[2].name, type: 'SET_BRANCH_SELECTED' }]);
  });

  afterEach(() => {
    dispatchMock.mockClear();
  });
});

describe('test functionality of files table', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that return button is rendered and works', async () => {
    await sleep(50);
    wrapper.setProps({});
    wrapper.find('#button-for-0').simulate('click');
    const returnBtnTd = wrapper.find('td.return-button');
    expect(returnBtnTd).toHaveLength(1);

    const preventDefault = jest.fn();

    returnBtnTd.childAt(0).simulate('click', { preventDefault });

    expect(preventDefault).toHaveBeenCalled();
  });
});

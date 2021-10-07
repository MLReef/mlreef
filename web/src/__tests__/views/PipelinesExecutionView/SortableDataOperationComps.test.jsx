import React from 'react';
import { mount, shallow } from 'enzyme';
import { dataProcessors, processorDetails } from './testData';
import SelectComp from 'components/views/PipelinesExecutionView/SelectComp/SelectComp';
import { initialState } from 'components/views/PipelinesExecutionView/DataPipelineHooks/DataPipelinesReducerAndFunctions';
import { DataPipelinesContext } from 'components/views/PipelinesExecutionView/DataPipelineHooks/DataPipelinesProvider';
import SortableProcessor, { SelectedProcessor } from 'components/views/PipelinesExecutionView/SortableDataProcessorsList/SortableProcessor';
import { generatePromiseResponse, sleep } from 'functions/testUtils';
import { commitMockObject } from 'testData';
import SortableListContainer from 'components/views/PipelinesExecutionView/SortableDataProcessorsList/SortableDataProcessorsList';

const dataOp = dataProcessors[0];
const param = dataOp.processors[0].parameters[5];
const options = JSON.parse(param.default_value);

const booleanParam = dataOp.processors[0].parameters[3];
const booleanParam1 = dataOp.processors[0].parameters[4];

const dispatchMock = jest.fn();

const mockUseReducer = [
  initialState,
  dispatchMock,
];

const setupSelect = (currentParm, isBoolean = false) => mount(
  <DataPipelinesContext.Provider value={mockUseReducer}>
    <SelectComp param={currentParm} isBoolean={isBoolean} dataProcessorId="88e8f90we890fwe890f890wef" />
  </DataPipelinesContext.Provider>,
);

const setupSortableProcessor = () => mount(
  <DataPipelinesContext.Provider value={mockUseReducer}>
    <SelectedProcessor value={dataOp} addInfo={{ index: 0, prefix: 'Op.' }} />
  </DataPipelinesContext.Provider>,
);

describe('test that select component works', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setupSelect(param);
  });

  test('test html elements presence', () => {
    expect(wrapper.find('MTooltip')).toHaveLength(1);
    expect(wrapper.find('MTooltip').props().message).toBe(param.description);
    expect(wrapper.find('button')).toHaveLength(1);
  });
});

describe('test the select component', () => {
  let wrapper;
  test('assert that select works for list params', () => {
    wrapper = setupSelect(param);
    wrapper.find('button').simulate('click');
    const liElements = wrapper.find('li');
    expect(liElements).toHaveLength(options.length + 1);
    expect(wrapper.find('input').props().value).toBe('');
    liElements.at(1).childAt(0).simulate('click');
    expect(wrapper.find('input').props().value).toBe(options[0].value);
  });
  test('assert that button work for booleans', () => {
    wrapper = setupSelect(booleanParam, true);
    wrapper.find('button').simulate('click');
    const liElements = wrapper.find('li');
    expect(wrapper.find('input').props().value).toBe('TRUE');
    liElements.at(2).childAt(0).simulate('click');
    expect(wrapper.find('input').props().value).toBe('false');
  });
  test('assert that validations work for select fields', () => {
    wrapper = setupSelect(booleanParam1, true);
    wrapper.find('button').simulate('click');
    const liElements = wrapper.find('li');
    liElements.at(0).childAt(0).simulate('click');
    expect(wrapper.find('ErrorsDiv')).toHaveLength(1);
  });
});

describe('test the whole sortable processor component', () => {
  let wrapper;
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((req) => {
      let bodyInfo = commitMockObject;
      if(req.url.includes(`/api/v1/code-projects/${dataOp.id}/publish/`)) {
        bodyInfo = processorDetails;
      }
      return generatePromiseResponse(200, true, bodyInfo, 10);
    });
    wrapper = setupSortableProcessor();
  });
  test('assert that dispatch is called correctly and basic info renders', async () => {
    await sleep(50);
    wrapper.setProps({});

    expect(wrapper
      .find('.sortable-data-operation-list-item-container-header-title')
      .childAt(0)
      .childAt(0)
      .text()
    ).toBe('OCR with tesseract Processor')

    const optionsDiv = wrapper.find('div.sortable-data-operation-list-item-container-header-options-main');
    expect(optionsDiv.find('button').length).toBe(3);
    // expect(
    //   wrapper
    //   .find('.sortable-data-operation-list-item-container-user-info-mss')
    //   .text()
    //   .includes('Replace color_0_0054_A.png')
    // ).toBeTruthy();
    
    optionsDiv.find('button').at(0).simulate('click');
    expect(dispatchMock.mock.calls[4][0]).toStrictEqual({ type: 'COPY_DATA_PROCESSOR_BY_INDEX', index: 0 });
    optionsDiv.find('button').at(1).simulate('click');
    expect(dispatchMock.mock.calls[6][0]).toStrictEqual({ type: 'REMOVE_DATA_PROCESSOR_BY_INDEX', index: 0 });
  });
});


describe('test the sorting area', () => {
  test('assert that props array is correct for the sortable element func',() => {
    const wrapper = mount(
      <DataPipelinesContext.Provider 
        value={[
          { ...initialState, processorsSelected: [dataOp] },
          dispatchMock
        ]}
      >
        <SortableListContainer prefix="Op." />
      </DataPipelinesContext.Provider>,
    );

    const sortableElementProps = wrapper.find('sortableElement(SelectedProcessor)').at(0).props();
    expect(sortableElementProps.index).toBeDefined();
    expect(sortableElementProps.addInfo).toStrictEqual({ index: 0, prefix: 'Op.' });
  })
})
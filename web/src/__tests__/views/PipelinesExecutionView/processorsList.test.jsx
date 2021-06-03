import React from 'react';
import { mount } from 'enzyme';
import { dataPipeLines } from 'testData';
import ProcessorsList, { Processor } from 'components/views/PipelinesExecutionView/processorsList';
import { DataPipelinesContext } from 'components/views/PipelinesExecutionView/DataPipelineHooks/DataPipelinesProvider';
import { initialState } from 'components/views/PipelinesExecutionView/DataPipelineHooks/DataPipelinesReducerAndFunctions';

const dispatchMock = jest.fn();

const mockUseReducer = [
  { ...initialState, currentProcessors: dataPipeLines },
  dispatchMock,
];

const setup = () => mount(
  <DataPipelinesContext.Provider value={mockUseReducer}>
    <ProcessorsList operationTypeToExecute="operation" />
  </DataPipelinesContext.Provider>,
);

const mockedProcessor = dataPipeLines[0];

const setupProcessor = () => mount(
  <DataPipelinesContext.Provider value={mockUseReducer}>
    <Processor
      processorData={mockedProcessor}
      dispatch={dispatchMock}
    />
  </DataPipelinesContext.Provider>,
);

describe('check processors on the first render', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });

  test('assert that data pipeline cards are shown', () => {
    expect(wrapper.find('Processor').length).toBe(dataPipeLines.length);
  });
});

describe('test specific features in processor comp', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setupProcessor();
  });
  test('assert that title, description and data type are in the comp', () => {
    const titleContent = wrapper.find('.processor-title > p').at(0);
    const imageIcon = wrapper.find('.processor-title > .input-images');
    wrapper.find('button').simulate('click', {});
    expect(titleContent.text()).toBe(mockedProcessor.name);
    expect(wrapper.find('.processor-content > p').text()).toBe(mockedProcessor.description);
    expect(imageIcon.find('.mr-2 > fa-images'));
  });

  test('assert that double click triggers a select data pipe', () => {
    wrapper.find('div.data-operations-list-item').simulate('doubleclick');
    expect(dispatchMock.mock.calls).toHaveLength(3);
    expect(dispatchMock.mock.calls[0][0])
      .toStrictEqual({ type: 'SET_PROCESSOR_SELECTED', processorData: mockedProcessor });
    expect(dispatchMock.mock.calls[1][0]).toStrictEqual({ type: 'ADD_NEW_PROCESSOR' });
    expect(dispatchMock.mock.calls[2][0])
      .toStrictEqual({ type: 'SET_PROCESSOR_SELECTED', processorData: null });
  });
});

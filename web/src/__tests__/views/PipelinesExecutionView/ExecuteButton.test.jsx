import React from 'react';
import { mount } from 'enzyme';
import { DataPipelinesContext } from 'components/views/PipelinesExecutionView/DataPipelineHooks/DataPipelinesProvider';
import { initialState } from 'components/views/PipelinesExecutionView/DataPipelineHooks/DataPipelinesReducerAndFunctions';
import ExecuteButton from 'components/views/PipelinesExecutionView/ExecuteButton';

let dispatchMock;

const setup = (isFormValid = false) => {
  dispatchMock = jest.fn();
  const mockedUseReducer = [
    {
      ...initialState,
      isFormValid,
    },
    dispatchMock,
  ];
  return mount(
    <DataPipelinesContext.Provider value={mockedUseReducer}>
      <ExecuteButton />
    </DataPipelinesContext.Provider>,
  );
};

describe('test execute button', () => {
  let wrapper;
  test('assert that button is disabled initially', () => {
    wrapper = setup();
    const executeBtn = wrapper.find('#execute-button');
    executeBtn.simulate('click');
    expect(dispatchMock).not.toHaveBeenCalled();

    expect(executeBtn.props().style)
      .toStrictEqual({ backgroundColor: '#F6F6F6', border: '1px solid #b2b2b2', color: '#2dbe91' });
  });

  test('assert that button is enabled when form valid equals true', () => {
    wrapper = setup(true);
    wrapper.find('#execute-button').simulate('click');
    expect(dispatchMock).toHaveBeenCalled();
  });

  afterEach(() => {
    dispatchMock.mockClear();
  });
});

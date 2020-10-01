import React from 'react';
import { mount } from 'enzyme';
import { ALGORITHM } from 'dataTypes';
import { DataPipelinesContext } from 'components/views/PipelinesExecutionView/DataPipelineHooks/DataPipelinesProvider';
import { initialState } from 'components/views/PipelinesExecutionView/DataPipelineHooks/DataPipelinesReducer';
import { projectsArrayMock } from 'testData';
import ExecutePipeLineModal from '../../../components/views/PipelinesExecutionView/ExecutePipelineModal/ExecutePipeLineModal';

const setup = () => {
  const mockUseReducer = [
    initialState,
    jest.fn(),
  ];
  return mount(
    <DataPipelinesContext.Provider value={mockUseReducer}>
      <ExecutePipeLineModal
        type={ALGORITHM}
        project={projectsArrayMock.projects.selectedProject}
      />
    </DataPipelinesContext.Provider>,
  );
};

describe('Check elements in the first render', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = setup();
  });
  test('assert that three buttons', () => {
    const buttonsArr = wrapper.find('button');
    expect(buttonsArr).toHaveLength(3);
  });

  test('assert that machines list is displayed after dropdown button click', () => {
    wrapper.find('MRadio #show-first-opt').simulate('click');
    expect(wrapper.find('#t-machine-selector')).toHaveLength(1);
  });
});

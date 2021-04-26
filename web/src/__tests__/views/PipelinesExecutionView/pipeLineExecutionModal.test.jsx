import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ALGORITHM, OPERATION } from 'dataTypes';
import { DataPipelinesContext } from 'components/views/PipelinesExecutionView/DataPipelineHooks/DataPipelinesProvider';
import { initialState } from 'components/views/PipelinesExecutionView/DataPipelineHooks/DataPipelinesReducer';
import { storeFactory } from 'functions/testUtils';
import { projectsArrayMock } from 'testData';
import ExecutePipeLineModal from '../../../components/views/PipelinesExecutionView/ExecutePipelineModal/ExecutePipeLineModal';
import { dataProcessors, selectedFiles } from './testData';

const dispatchFunction = jest.fn();

const setup = (type = ALGORITHM) => {
  jest.spyOn(global, 'fetch');
  const mockUseReducer = [{
    ...initialState,
    processorsSelected: dataProcessors,
    filesSelectedInModal: selectedFiles,
    branchSelected: 'master',
  },
  dispatchFunction,
  ];
  const store = storeFactory({});
  return mount(
    <Provider store={store}>
      <MemoryRouter>
        <DataPipelinesContext.Provider value={mockUseReducer}>
          <ExecutePipeLineModal
            type={type}
            project={projectsArrayMock.projects.selectedProject}
          />
        </DataPipelinesContext.Provider>
      </MemoryRouter>
    </Provider>,
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
  afterEach(
    () => global.fetch.mockClear(),
  );
});

describe('test functionality', () => {
  let wrapper;
  test('assert button submit functionality is correct for experiments', () => {
    wrapper = setup(ALGORITHM);
    wrapper.find('button#show-machines').simulate('click');
    const request = global.fetch.mock.calls[0][0];

    expect(request.url).toBe('/api/v1/data-projects/this-is-the-mlreef-uuid/experiments');
    expect(request.method).toBe('POST');
    const requestBody = JSON.parse(request._bodyInit);
    expect(requestBody.source_branch).toBe('master');
    expect(requestBody.input_files).toStrictEqual([{
      location: 'train',
      location_type: 'PATH_FOLDER',
    }]);
    expect(requestBody.processing.slug).toBe(dataProcessors[0].slug);
  });

  test('assert button submit functionality is correct for data operations', () => {
    wrapper = setup(OPERATION);
    wrapper.find('button#show-machines').simulate('click');
    const request = global.fetch.mock.calls[0][0];
    expect(request.url).toBe('/api/v1/data-projects/this-is-the-mlreef-uuid/pipelines/create-start-instance');
    expect(request.method).toBe('POST');
    const requestBody = JSON.parse(request._bodyInit);
    expect(requestBody.source_branch).toBe('master');
    expect(requestBody.input_files).toStrictEqual([{
      location: 'train',
      location_type: 'PATH_FOLDER',
    }]);
    expect(requestBody.data_operations[0].slug).toBe(dataProcessors[0].slug);
    wrapper.find('button#show-machines').simulate('click');
  });

  test('assert close modoal is called', () => {
    wrapper = setup(OPERATION);
    wrapper.find('#return-to-pipes').simulate('click');
    expect(dispatchFunction.mock.calls[0][0]).toStrictEqual({
      type: 'SET_IS_SHOWING_EXECUTE_PIPELINE_MODAL',
      isShowingExecutePipelineModal: false,
    });
  });
});

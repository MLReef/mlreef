import {
  REMOVE_DATA_PROCESSOR_BY_ID,
  SET_BRANCH_SELECTED,
  SET_IS_SHOWING_EXECUTE_PIPELINE_MODAL,
  SET_IS_VISIBLE_FILES_MODAL,
  SET_PROCESSOR_SELECTED,
  UPDATE_FILES_SELECTED_IN_MODAL,
  UPDATE_PROCESSORS_SELECTED,
  VALIDATE_FORM,
  UPDATE_PARAM_VALUE_IN_DATA_OPERATOR,
  REMOVE_DATA_PROCESSOR_BY_INDEX,
} from 'components/views/PipelinesExecutionView/DataPipelineHooks/actions';
import DataPipelinesReducer, { addInformationToProcessors, initialState } from 'components/views/PipelinesExecutionView/DataPipelineHooks/DataPipelinesReducerAndFunctions';
import { filesMock } from 'testData';
import { dataProcessors as dataPipeLines } from './testData';
import { validateForm } from '../../../functions/validations';
import { parseToCamelCase } from 'functions/dataParserHelpers';

test('assert that reducer updates the processorsSelected', () => {
  expect(initialState.processorsSelected).toHaveLength(0);
  const { processorsSelected } = DataPipelinesReducer(
    initialState,
    { type: UPDATE_PROCESSORS_SELECTED, processorsSelected: dataPipeLines },
  );
  expect(processorsSelected).toStrictEqual(dataPipeLines);
});

test('assert that reducer removes processor from state based on Ind', () => {
  const { processorsSelected } = DataPipelinesReducer(
    { ...initialState, processorsSelected: [dataPipeLines[0], {...dataPipeLines[0], slug: 'ocr-with-tesseract-jaja-1' }] },
    { type: REMOVE_DATA_PROCESSOR_BY_INDEX, index: 0 },
  );
  expect(processorsSelected).toHaveLength(1);
  expect(processorsSelected[0].slug).toBe('ocr-with-tesseract-jaja-1');
});

test('assert that files modal visibility can be changed', () => {
  const newIsVisibleSelectFilesModal = true;
  const { isVisibleSelectFilesModal } = DataPipelinesReducer(
    initialState,
    { type: SET_IS_VISIBLE_FILES_MODAL, isVisibleSelectFilesModal: newIsVisibleSelectFilesModal },
  );
  expect(isVisibleSelectFilesModal).toBe(newIsVisibleSelectFilesModal);
});

test('assert that files selected in modal can be updated', () => {
  const newFilesSelectedInModal = filesMock;
  const { filesSelectedInModal } = DataPipelinesReducer(
    initialState,
    { type: UPDATE_FILES_SELECTED_IN_MODAL, filesSelectedInModal: newFilesSelectedInModal },
  );
  expect(filesSelectedInModal).toStrictEqual(newFilesSelectedInModal);
});

test('assert that branch selected in modal can be updated', () => {
  const newBranch = 'some-new-branch';
  const { branchSelected } = DataPipelinesReducer(
    initialState,
    { type: SET_BRANCH_SELECTED, branchSelected: newBranch },
  );
  expect(branchSelected).toStrictEqual(newBranch);
});

test('assert that execution modal visibility can be changed', () => {
  const newIsShowingExecutePipelineModal = true;
  const { isShowingExecutePipelineModal } = DataPipelinesReducer(
    initialState, {
      type: SET_IS_SHOWING_EXECUTE_PIPELINE_MODAL,
      isShowingExecutePipelineModal: newIsShowingExecutePipelineModal,
    },
  );
  expect(isShowingExecutePipelineModal).toStrictEqual(newIsShowingExecutePipelineModal);
});

test('assert that reducer updates the processorDataSelected', () => {
  const newProcessorDataSelected = dataPipeLines[0];
  expect(initialState.processorDataSelected).toBe(null);
  const { processorDataSelected } = DataPipelinesReducer(
    initialState,
    { type: SET_PROCESSOR_SELECTED, processorData: newProcessorDataSelected },
  );
  expect(processorDataSelected).toStrictEqual(newProcessorDataSelected);
});

test('assert that validateForm function validates the form correctly', () => {
  const isFormValid = validateForm(filesMock, dataPipeLines);
  expect(isFormValid).toBe(false);

  const isSecondFormValid = validateForm(
    filesMock,
    dataPipeLines.map((dp) => ({
      ...dp, 
      processors: dp.processors.map((p) => ({
        ...p,
        parameters: p.parameters.map((param) => ({ ...param, isValid: true })),
      }))
    })),
  );
  expect(isSecondFormValid).toBe(true);

  const isThirdFormValid = validateForm(
    null,
    dataPipeLines,
  );
  expect(isThirdFormValid).toBe(false);

  const isFourthFormValid = validateForm(
    filesMock,
    null,
  );
  expect(isFourthFormValid).toBe(false);
});

test('assert that form validation function is called', () => {
  const { isFormValid } = DataPipelinesReducer({
    ...initialState,
    filesSelectedInModal: filesMock,
    processorsSelected: dataPipeLines.map((pr) => ({ 
      ...pr,
      processorSelected: 0,
      processors: pr.processors.map((cP) => parseToCamelCase({
        ...cP,
        parameters: cP.parameters.map((param) => ({ ...param, isValid: true })),
      })),
    }))
  }, { type: VALIDATE_FORM });
  expect(isFormValid).toBe(true);
});

test('assert that parameter is updated correctly', () => {
  const newParamValue = 'some-path';
  const { processorsSelected } = DataPipelinesReducer({
    ...initialState,
    processorsSelected: dataPipeLines.map((pr) => ({ 
      ...pr,
      processorSelected: 0,
      processors: addInformationToProcessors(pr.processors),
    })),
  }, {
    type: UPDATE_PARAM_VALUE_IN_DATA_OPERATOR,
    newParamValue,
    paramName: 'input-path',
    procSelectedId: 'bc65cfbf-c09c-40ec-8bd5-d984ceb0e8b1',
    isValid: true,
  });
  expect(processorsSelected[0].processors[0].parameters[0].value).not.toBeDefined();
  expect(processorsSelected[0].processors[0].parameters[1].value).toBe(newParamValue);
  expect(processorsSelected[0].processors[0].parameters[2].value).not.toBeDefined();
});

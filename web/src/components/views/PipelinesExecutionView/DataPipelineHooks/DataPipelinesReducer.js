import { ALGORITHM, OPERATION } from 'dataTypes';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import { validateForm } from 'functions/validations';
import UUIDV1 from 'uuid/v1';
import {
  ADD_NEW_PROCESSOR,
  UPDATE_PROCESSORS_SELECTED,
  REMOVE_DATA_PROCESSOR_BY_ID,
  UPDATE_INITIAL_FILES,
  SET_IS_VISIBLE_FILES_MODAL,
  UPDATE_FILES_SELECTED_IN_MODAL,
  SET_BRANCH_SELECTED,
  SET_INITIAL_OPERATORS_SELECTED,
  SET_IS_SHOWING_EXECUTE_PIPELINE_MODAL,
  SET_PROCESSOR_SELECTED,
  VALIDATE_FORM,
  UPDATE_PARAM_VALUE_IN_DATA_OPERATOR,
} from './actions';

const updateOperators = (
  newParamValue,
  paramName,
  procSelectedId,
  processorsSelected,
  isValid,
) => processorsSelected.map((ps) => {
  if (ps.internalProcessorId === procSelectedId) {
    return {
      ...ps,
      parameters: ps.parameters.map((p) => {
        if (p.name === paramName) {
          return {
            ...p,
            value: newParamValue,
            isValid,
          };
        }
        return p;
      }),
    };
  }
  return ps;
});

export function setProcessors(nonFilteredProcessors, type) {
  let filteredProcessors;
  if (type === OPERATION) {
    filteredProcessors = nonFilteredProcessors.operations;
  } else if (type === ALGORITHM) {
    filteredProcessors = nonFilteredProcessors.algorithms;
  } else {
    filteredProcessors = nonFilteredProcessors.visualizations;
  }

  return filteredProcessors
    .filter((cP) => cP !== null && cP !== undefined)
    .map((cP) => parseToCamelCase({
      ...cP,
      internalProcessorId: UUIDV1(),
      parameters: cP.parameters.map((param) => ({ ...param, isValid: !param.required })),
    }));
}

export const initialState = {
  branchSelected: null,
  project: {},
  processorDataSelected: null,
  isShowingExecutePipelineModal: false,
  currentProcessors: [],
  isVisibleSelectFilesModal: false,
  processorsSelected: [],
  filesSelectedInModal: [],
  branches: [],
  initialFiles: null,
  isFormValid: false,
};

const DataPipelinesReducer = (state, action) => {
  switch (action.type) {
    case ADD_NEW_PROCESSOR:
      return state.processorsSelected.filter((
        { internalProcessorId },
      ) => internalProcessorId === state.processorDataSelected.internalProcessorId).length > 0
        ? { ...state }
        : {
          ...state,
          processorsSelected: [...state.processorsSelected, state.processorDataSelected],
        };
    case UPDATE_PROCESSORS_SELECTED:
      return { ...state, processorsSelected: action.processorsSelected };
    case REMOVE_DATA_PROCESSOR_BY_ID:
      return {
        ...state,
        processorsSelected: state
          .processorsSelected
          .filter((pS) => pS.internalProcessorId !== action.id),
      };
    case UPDATE_INITIAL_FILES:
      return { ...state, initialFiles: action.initialFiles };
    case SET_IS_VISIBLE_FILES_MODAL:
      return { ...state, isVisibleSelectFilesModal: action.isVisibleSelectFilesModal };
    case UPDATE_FILES_SELECTED_IN_MODAL:
      return { ...state, filesSelectedInModal: action.filesSelectedInModal };
    case SET_BRANCH_SELECTED:
      return { ...state, branchSelected: action.branchSelected };
    case SET_INITIAL_OPERATORS_SELECTED:
      return {
        ...state,
        processorsSelected: action.initialDataOperators
          .map((initDataOPerator) => {
            const filteredProcessor = state.currentProcessors
              .filter((cP) => cP.slug === initDataOPerator.slug)[0];
            return {
              ...filteredProcessor,
              parameters: filteredProcessor?.parameters?.map((param) => {
                const filteredParams = initDataOPerator
                  ?.parameters
                  ?.filter((executedParam) => param.name === executedParam.name);
                if (filteredParams.length === 0) return { ...param };
                return {
                  ...param,
                  value: filteredParams[0].value,
                };
              }),
            };
          }),
      };
    case SET_IS_SHOWING_EXECUTE_PIPELINE_MODAL:
      return { ...state, isShowingExecutePipelineModal: action.isShowingExecutePipelineModal };
    case SET_PROCESSOR_SELECTED:
      return { ...state, processorDataSelected: action.processorData };
    case VALIDATE_FORM:
      return {
        ...state,
        isFormValid: validateForm(state.filesSelectedInModal, state.processorsSelected),
      };

    case UPDATE_PARAM_VALUE_IN_DATA_OPERATOR:
      return {
        ...state,
        processorsSelected: updateOperators(
          action.newParamValue,
          action.paramName,
          action.procSelectedId,
          state.processorsSelected,
          action.isValid,
        ),
      };
    default:
      return state;
  }
};

export default DataPipelinesReducer;

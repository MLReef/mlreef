import MLSearchApi from 'apis/MLSearchApi';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import { validateForm } from 'functions/validations';
import UUIDV1 from 'uuid/v1';
import {
  ADD_NEW_PROCESSOR,
  UPDATE_PROCESSORS_SELECTED,
  REMOVE_DATA_PROCESSOR_BY_ID,
  UPDATE_INITIAL_INFORMATION,
  SET_IS_VISIBLE_FILES_MODAL,
  UPDATE_FILES_SELECTED_IN_MODAL,
  SET_BRANCH_SELECTED,
  SET_INITIAL_OPERATORS_SELECTED,
  SET_IS_SHOWING_EXECUTE_PIPELINE_MODAL,
  SET_PROCESSOR_SELECTED,
  VALIDATE_FORM,
  UPDATE_PARAM_VALUE_IN_DATA_OPERATOR,
} from './actions';

const mlSearchApi = new MLSearchApi();

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

export const addInformationToProcessors = (processors) => processors
  .filter((cP) => cP !== null && cP !== undefined)
  .map((cP) => parseToCamelCase({
    ...cP,
    internalProcessorId: UUIDV1(),
    parameters: cP.parameters.map((param) => ({ ...param, isValid: !param.required })),
  }));

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
  initialInformation: { initialFiles: [] },
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
    case UPDATE_INITIAL_INFORMATION:
      return { ...state, initialInformation: action.initialInformation };
    case SET_IS_VISIBLE_FILES_MODAL:
      return { ...state, isVisibleSelectFilesModal: action.isVisibleSelectFilesModal };
    case UPDATE_FILES_SELECTED_IN_MODAL:
      return { ...state, filesSelectedInModal: action.filesSelectedInModal };
    case SET_BRANCH_SELECTED:
      return { ...state, branchSelected: action.branchSelected };
    case SET_INITIAL_OPERATORS_SELECTED:
      return {
        ...state,
        processorsSelected: action.initialDataOperators,
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

export const fetchProcessorsPaginatedByType = (operationTypeToExecute) => mlSearchApi
  .searchPaginated(operationTypeToExecute, { published: true }, 0, 20)
  .then((res) => res.content)
  .then((projects) => projects.map((proj) => {
    const {
      gitlab_namespace: nameSpace,
      slug: projSlug,
      input_data_types: inputDataTypes,
      stars_count: stars,
      data_processor: processor,
    } = proj;
    return {
      ...processor,
      parameters: processor.versions[0].parameters,
      nameSpace,
      slug: projSlug,
      inputDataTypes,
      stars,
    };
  }))


export default DataPipelinesReducer;

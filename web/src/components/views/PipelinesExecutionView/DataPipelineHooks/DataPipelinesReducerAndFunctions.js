import DataPiplineApi from 'apis/DataPipelineApi';
import ExperimentsApi from 'apis/experimentApi';
import MLSearchApi from 'apis/MLSearchApi';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';
import { parseToCamelCase } from 'functions/dataParserHelpers';
import { validateForm } from 'functions/validations';
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
  UPDATE_CURRENT_PROCESSORS_ARRAY,
  UPDATE_OPERATOR_SELECTED,
  REMOVE_DATA_PROCESSOR_BY_INDEX,
  COPY_DATA_PROCESSOR_BY_INDEX,
} from './actions';

const mlSearchApi = new MLSearchApi();

const projectAPi = new ProjectGeneralInfoApi();

const dataPipelineApi = new DataPiplineApi();

const experimentsApi = new ExperimentsApi();

const updateOperators = (
  newParamValue,
  paramName,
  procSelectedId,
  processorsSelected,
  index,
  isValid,
) => processorsSelected.map((ps, ind) => {
  if (ps.id === procSelectedId && index === ind) {
    const proc = ps.processors[ps.processorSelected];
    const newProc = {
      ...proc,
      parameters: proc.parameters.map((p) => {
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
    const newProcessors = ps.processors;
    newProcessors[ps.processorSelected] = newProc;

    return {
      ...ps,
      processors: newProcessors,
    };
  }
  return ps;
});

export const addInformationToProcessors = (processors) => processors
  .map((cP) => parseToCamelCase({
    ...cP,
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
        { id },
      ) => id === state.processorDataSelected.id).length > 0
        ? { ...state }
        : {
          ...state,
          processorsSelected: [...state.processorsSelected, state.processorDataSelected],
        };
    case UPDATE_PROCESSORS_SELECTED:
      return { ...state, processorsSelected: action.processorsSelected };
    case REMOVE_DATA_PROCESSOR_BY_INDEX:
      return {
        ...state,
        processorsSelected: state
          .processorsSelected
          .filter((_, ind) => ind !== action.index),
      };
    case COPY_DATA_PROCESSOR_BY_INDEX:
      return {
        ...state,
        processorsSelected: [...state.processorsSelected, state.processorsSelected[action.index]]
      }
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
          action.index,
          action.isValid,
        ),
      };
    case UPDATE_OPERATOR_SELECTED:
      return {
        ...state,
        processorsSelected: state.processorsSelected.map((ps, ind) => {
          if (ps.id === action.processorId && action.index === ind) {
            return {
              ...ps,
              processorSelected: action.newProcessorSelected,
            };
          }
          return ps;
        }),
      };
    case UPDATE_CURRENT_PROCESSORS_ARRAY:
      return {
        ...state,
        currentProcessors: action.currentProcessors,
      };
    default:
      return state;
  }
};

export const mapProcessorFields = (projects) => projects.map((proj) => {
  const {
    id,
    name,
    gitlab_id: gid,
    gitlab_namespace: nameSpace,
    slug: projSlug,
    input_data_types: inputDataTypes,
    stars_count: stars,
    processors,
  } = proj;
  return {
    id,
    gid,
    name,
    nameSpace,
    slug: projSlug,
    inputDataTypes,
    stars,
    processors,
  };
});

export const fetchProcessorsPaginatedByType = (
  operationTypeToExecute, body, page = 0, size = 20,
) => mlSearchApi
  .searchPaginated(operationTypeToExecute, body, page, size)
  .then((res) => res.content)
  .then(mapProcessorFields);

export const mergeWithCodeProjectInfo = (dataOperation) => projectAPi
  .getCodeProjectById(dataOperation.project_id)
  .then((project) => {
    const proc = project.processors
      .filter((pr) => pr.branch === dataOperation.branch
      && pr.version === dataOperation.version)[0];

    const processorSelected = project.processors.indexOf(proc);
    return {
      ...project,
      gid: project.gitlab_id,
      processorSelected,
      processors: project
        .processors
        .map(parseToCamelCase)
        .map((proce, ind) => ind === processorSelected
          ? { ...proce, parameters: dataOperation.parameters } : proce),
    };
  });

const endpointCall = (projectId, dataId, isExperiment) => isExperiment
  ? experimentsApi.getExperimentDetails(projectId, dataId)
  : dataPipelineApi.getBackendPipelineById(dataId);

export const fetchInitialInfo = (
  projectId, dataId, isExperiment
) => endpointCall(projectId, dataId, isExperiment).then(async (res) => {
  const pipeJobInfo = isExperiment
    ? res.pipeline_job_info
    : res.instances[0]?.pipeline_job_info;

  const dops = isExperiment ? [res.processing] : res.data_operations;

  const dataOperatorsExecuted = await Promise.all(dops.map(mergeWithCodeProjectInfo));

  return {
    initialFiles: res?.input_files,
    initialBranch: pipeJobInfo?.ref,
    initialCommit: pipeJobInfo?.commit_sha,
    dataOperatorsExecuted,
  };
});

export default DataPipelinesReducer;

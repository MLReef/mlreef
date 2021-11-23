export default {
  path: '',
  files: [],
  listOfEnvs: [],
  entryPointFile: null,
  selectedEnv: null,
  requirementsFile: null,
  model: null,
  mlCategory: null,
  areTermsAccepted: false,
  isPublishing: false,
};

const calculateAreTermsAccepted = (areTermsAccepted) => {
  if (areTermsAccepted) {
    const dateOfUserAcceptance = new Date().getTime();
    return dateOfUserAcceptance.toString();
  }

  return false;
}

export const reducer = (state, { type, payload }) => {
  switch (type) {
    case 'SET_PATH':
      return { ...state, path: payload };
    case 'SET_SELECTED_BRANCH':
      return { ...state, selectedBranch: payload };
    case 'SET_FILES':
      return { ...state, files: payload };
    case 'SET_ENTRY_POINT':
      return { ...state, entryPointFile: payload };
    case 'SET_ENVIRONMENT':
      return { ...state, selectedEnv: state.selectedEnv === payload ? null : payload };
    case 'SET_REQUIREMENTS_FILE':
      return { ...state, requirementsFile: payload };
    case 'SET_MODEL':
      return { ...state, model: state.model === payload ? null : payload };
    case 'SET_ML_CATEGORY':
      return { ...state, mlCategory: state.mlCategory === payload ? null : payload };
    case 'SET_TERMS_ACCEPTED':
      return { ...state, areTermsAccepted: calculateAreTermsAccepted(payload) };
    case 'SET_IS_PUBLISHING':
      return { ...state, isPublishing: payload };
    case 'SET_LIST_OF_ENVS':
      return { ...state, listOfEnvs: payload };
    default:
      return state;
  }
};

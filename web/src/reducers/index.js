import { combineReducers } from 'redux';
import files from './filesReducer';
import projects from './projectReducer';
import file from './fileReducer';
import branches from './branchesReducer';

const rootReducer = combineReducers({
  files,
  projects,
  file,
  branches,
});

export default rootReducer;

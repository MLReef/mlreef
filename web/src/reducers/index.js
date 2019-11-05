import { combineReducers } from 'redux';
import files from './filesReducer';
import projects from './projectReducer';
import file from './fileReducer';
import branches from './branchesReducer';
import users from './usersReducer';

const rootReducer = combineReducers({
  files,
  projects,
  file,
  branches,
  users,
});

export default rootReducer;

import { combineReducers } from 'redux';
import files from './filesReducer';
import projects from './projectReducer';
import file from './fileReducer';
import branches from './branchesReducer';
import jobs from './jobsReducer';
import users from './usersReducer';
import mergeRequests from './mergeReducer';
import user from './userReducer';

const rootReducer = combineReducers({
  branches,
  files,
  file,
  jobs,
  projects,
  users,
  mergeRequests,
  user,
});

export default rootReducer;

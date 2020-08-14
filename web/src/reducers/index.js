import { combineReducers } from 'redux';
import projects from './projectReducer';
import branches from './branchesReducer';
import jobs from './jobsReducer';
import users from './usersReducer';
import mergeRequests from './mergeReducer';
import user from './userReducer';
import actionModal from './actionModalReducer';
import groups from './groupsReducer';
import processors from './processorReducer';
import globalMarker from './globalMarkerReducer';

const rootReducer = combineReducers({
  branches,
  jobs,
  projects,
  users,
  mergeRequests,
  user,
  actionModal,
  groups,
  processors,
  globalMarker,
});

export default rootReducer;

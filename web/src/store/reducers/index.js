import { combineReducers } from 'redux';
import projects from './projectReducer';
import marketplace from './marketplaceReducer';
import branches from './branchesReducer';
import jobs from './jobsReducer';
import users from './usersReducer';
import mergeRequests from './mergeReducer';
import user from './userReducer';
import actionModal from './actionModalReducer';
import groups from './groupsReducer';
import globalMarker from './globalMarkerReducer';
import errors from './errorsReducer';

const rootReducer = combineReducers({
  branches,
  jobs,
  projects,
  marketplace,
  users,
  mergeRequests,
  user,
  actionModal,
  groups,
  globalMarker,
  errors,
});

export default rootReducer;

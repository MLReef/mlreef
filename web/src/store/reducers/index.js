import { combineReducers } from 'redux';
import projects from './projectReducer';
import marketplace from './marketplaceReducer';
import branches from './branchesReducer';
import jobs from './jobsReducer';
import users from './usersReducer';
import mergeRequests from './mergeReducer';
import userReducer from './userReducer';
import actionModal from './actionModalReducer';
import groups from './groupsReducer';
import globalMarker from './globalMarkerReducer';
import tutorial from './tutorialReducer';
import errors from './errorsReducer';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import { persistReducer } from 'redux-persist';

const userPersitConfig = {
  key: 'user',
  storage,
  blacklist: [
    'globalColorMarker',  
  ]
}

const rootReducer = combineReducers({
  branches,
  jobs,
  projects,
  marketplace,
  users,
  mergeRequests,
  user: persistReducer(userPersitConfig, userReducer),
  actionModal,
  groups,
  globalMarker,
  tutorial,
  errors,
});

export default rootReducer;

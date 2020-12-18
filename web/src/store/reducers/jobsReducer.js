import initialState from './initialState';
import { GET_JOBS } from '../actionTypes';

export default function jobsReducer(state = initialState.jobs, action) {
  switch (action.type) {
    case GET_JOBS:
      return Object.assign([], action.jobs);
    default:
      return state;
  }
}

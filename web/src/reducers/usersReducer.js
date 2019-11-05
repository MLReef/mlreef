import initialState from './initialState';
import { SET_PROJECT_USERS } from '../actions/actionTypes';

export default function usersReducer(state = initialState.users, action) {
  switch (action.type) {
    case SET_PROJECT_USERS:
      return Object.assign([], action.users);
    default:
      return state;
  }
}

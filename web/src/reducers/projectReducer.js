import initialState from "./initialState";
import * as types from '../actions/actionTypes';

export default function projectReducer(state = initialState.project, action) {
    switch (action.type) {
        case types.GET_GENERAL_INFO_REPO:
            return Object.assign({}, state, action.project);
        default:
            return state;
    }
}
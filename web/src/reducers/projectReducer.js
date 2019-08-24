import initialState from "./initialState";
import * as types from '../actions/actionTypes';

export default function projectReducer(state = initialState.projectsList, action) {
    switch (action.type) {
        case types.GET_LIST_OF_PROJECTS:
            return Object.assign([], state.projectsList, action.projects);
        default:
            return state;
    }
}
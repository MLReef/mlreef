import initialState from "./initialState";
import * as types from '../actions/actionTypes';

export default function projectReducer(state = initialState.projects, action) {
    switch (action.type) {
        case types.GET_LIST_OF_PROJECTS:
            state.all = [...action.projects];
            return {...state};
        case types.SET_SELECTED_PROJECT:
            state.selectedProject = action.project;
            return {...state};
        default:
            return state;
    }
}
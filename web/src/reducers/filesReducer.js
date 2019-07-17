import initialState from "./initialState";
import * as types from '../actions/actionTypes';

export default function filesReducer(state = initialState.files, action){
    switch (action.type) {
        case types.GET_ALL_FILES_REPO:
            return Object.assign([], action.files);
                
        default:
            return state;
    }
}
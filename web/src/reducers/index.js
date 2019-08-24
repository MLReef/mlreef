import {combineReducers} from 'redux';
import files from "./filesReducer";
import projects from "./projectReducer";
import file from "./fileReducer";

const rootReducer = combineReducers({
    files,
    projects,
    file
});

export default rootReducer;
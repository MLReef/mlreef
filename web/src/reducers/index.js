import {combineReducers} from 'redux';
import files from "./filesReducer";
import project from "./projectReducer";
import file from "./fileReducer";

const rootReducer = combineReducers({
    files,
    project,
    file
});

export default rootReducer;
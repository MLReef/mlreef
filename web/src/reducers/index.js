import {combineReducers} from 'redux';
import files from "./filesReducer";

const rootReducer = combineReducers({
    files
});

export default rootReducer;
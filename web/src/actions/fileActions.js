import * as types from './actionTypes';
import filesApi from "./../apis/FilesApi";

export function loadFilesSuccessfully(files) {
    return {type: types.GET_ALL_FILES_REPO,files}
}

export function loadFiles(){
    return function(dispatch) {
        let token = "4s129mSs6v1iw_uDzDc7";
        let projectId = "12395599";
        let path = "";

        return filesApi.getFilesPerProject(token, projectId, path).then(files => {
            dispatch(loadFilesSuccessfully(files));
        }).catch(err => {
            throw err;
        }) ;
    }
}

import * as types from './actionTypes';
import filesApi from "./../apis/FilesApi";

export function loadFilesSuccessfully(files) {
    return {type: types.GET_ALL_FILES_REPO, files}
}

export function getFileInfoSuccessfully(fileData) {
    return {type: types.GET_FILE_DATA, fileData}
}

export function updatePathToFile(path){
    return {type: types.UPDATE_PATH_TO_FILE, path}
}

export function loadFiles(path, branch){
    return function(dispatch) {
        let token = "4s129mSs6v1iw_uDzDc7";
        let projectId = "12395599";
        let recursive = false;
        let domain = "gitlab.com";

        return filesApi.getFilesPerProject(token, projectId, path, recursive, domain, branch).then(files => {
            dispatch(loadFilesSuccessfully(files));
        }).catch(err => {
            throw err;
        }) ;
    }
}

export function getFileData(path, branch){
    return function(dispatch) {
        let token = "4s129mSs6v1iw_uDzDc7";
        let projectId = "12395599";
        let domain = "gitlab.com";

        return filesApi.getFileData(domain, projectId, path, branch, token).then(file => {
            dispatch(getFileInfoSuccessfully(file));
        }).catch(err => {
            throw err;
        }) ;
    }
}
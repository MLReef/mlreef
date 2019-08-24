import * as types from './actionTypes';
import filesApi from "./../apis/FilesApi";

export function loadFilesSuccessfully(files) {
    return {type: types.GET_ALL_FILES_REPO, files}
}

export function getFileInfoSuccessfully(fileData) {
    return {type: types.GET_FILE_DATA, fileData}
}

export function loadFiles(path, branch, projectId){
    return async function(dispatch) {
        let recursive = false;
        let domain = "gitlab.com";

        try {
            const files = await filesApi.getFilesPerProject(projectId, path ? path : "", recursive, domain, branch);
            dispatch(loadFilesSuccessfully(files));
        }
        catch (err) {
            throw err;
        }
    }
}

export function getFileData(path, branch){
    return async function(dispatch) {   
        let projectId = "12395599";
        let domain = "gitlab.com";

        try {
            const file = await filesApi.getFileData(domain, projectId, path, branch);
            dispatch(getFileInfoSuccessfully(file));
        }
        catch (err) {
            throw err;
        }
    }
}
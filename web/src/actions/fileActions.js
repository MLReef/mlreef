import * as types from './actionTypes';
import filesApi from '../apis/FilesApi';

export function loadFilesSuccessfully(files) {
  return { type: types.GET_ALL_FILES_REPO, files };
}

export function getFileInfoSuccessfully(fileData) {
  return { type: types.GET_FILE_DATA, fileData };
}

export function loadFiles(path, branch, projectId, recursive) {
  return async (dispatch) => {
    const files = await filesApi.getFilesPerProject(projectId, path || '', recursive, branch);
    dispatch(loadFilesSuccessfully(files));
  };
}

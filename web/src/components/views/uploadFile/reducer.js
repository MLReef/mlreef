import {
  SET_FILEUPLOAD,
  SET_CONTENT,
  SET_TARGET,
  SET_MSG,
  SET_MR,
  SET_UPLOADBTN,
  SET_PROGRESS,
  SET_LOADING,
}
from "./uploadFileActions";

export default (state, { type, payload }) => {
  switch (type) {
    case SET_FILEUPLOAD:
      return { ...state, fileUploaded: payload }
    case SET_CONTENT:
      return { ...state, fileContent: payload }
    case SET_TARGET:
      return { ...state, targetBranch: payload }
    case SET_MSG:
      return { ...state, commitMsg: payload }
    case SET_MR:
      return { ...state, startMR: payload }
    case SET_UPLOADBTN:
      return { ...state, isAValidForm: payload }
    case SET_PROGRESS:
      return { ...state, progress: payload }
    case SET_LOADING:
      return { ...state, isFileLoaded: payload }
  
    default:
      throw Error("Action not supported");
  }
}
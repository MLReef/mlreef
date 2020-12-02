import {
  SET_FILESUPLOAD,
  REMOVE_FILE,
  SET_CONTENT,
  SET_TARGET,
  SET_MSG,
  SET_MR,
  SET_UPLOADBTN,
  SET_PROGRESS,
  SET_LOADING,
  SET_SENDING_FILES,
}
  from './uploadConstantsAndFunctions';

export default (state, { type, payload }) => {
  const { filesToUpload: prevFilesArr } = state;
  const { fileId } = payload;
  const file = prevFilesArr.filter((f) => f.getId() === fileId)[0];
  const fileIndex = prevFilesArr.indexOf(file);

  switch (type) {
    case SET_FILESUPLOAD:
      return { ...state, filesToUpload: [...prevFilesArr, ...payload] };
    case REMOVE_FILE:
      return { ...state, filesToUpload: prevFilesArr.filter((f) => f.getId() !== fileId) };
    case SET_CONTENT:
      file.setContent(payload.content);
      prevFilesArr[fileIndex] = file;
      return { ...state, filesToUpload: prevFilesArr };
    case SET_TARGET:
      return { ...state, targetBranch: payload };
    case SET_MSG:
      return { ...state, commitMsg: payload };
    case SET_MR:
      return { ...state, startMR: payload };
    case SET_UPLOADBTN:
      return { ...state, isAValidForm: payload };
    case SET_PROGRESS:
      file.setProg(payload.progress);
      prevFilesArr[fileIndex] = file;
      return { ...state, progress: payload };
    case SET_LOADING:
      return { ...state, areFilesLoaded: payload };
    case SET_SENDING_FILES:
      return { ...state, isSendingFiles: payload };

    default:
      throw Error('Action not supported');
  }
};

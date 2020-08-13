import Base64ToArrayBuffer from 'base64-arraybuffer';
import { CREATE } from 'dataTypes';
import UUIDV1 from 'uuid/v1';
import FileToUpload from './FileToUpload.ts';

export const formatsWhichNeedbase64Encode = [
  'image',
  'application',
];

export const SET_FILESUPLOAD = 'setFilesUpload';
export const REMOVE_FILE = 'removeFile';
export const SET_CONTENT = 'setContent';
export const SET_TARGET = 'setTarget';
export const SET_MSG = 'setMsg';
export const SET_MR = 'setMR';
export const SET_UPLOADBTN = 'setUploadBtn';
export const SET_PROGRESS = 'setProgress';
export const SET_LOADING = 'setLoading';
export const SET_SENDING_FILES = 'setSendingFiles';

export const MAX_SIZE_FILE_PERMITTED = 10000000;

export const initialState = {
  filesToUpload: [],
  targetBranch: '',
  commitMsg: 'Upload New File',
  startMR: false,
  isAValidForm: false,
  progress: 0,
  areFilesLoaded: false,
  isSendingFiles: false,
};

export const isFileExtensionForBase64Enc = (type) => formatsWhichNeedbase64Encode
  .map((formatToTest) => type
    .includes(formatToTest))
  .filter((isIncluded) => isIncluded)
  .length > 0;

export const processFiles = (rawFiles) => {
  const arrayFormatFiles = Array.from(rawFiles);
  const totalSize = arrayFormatFiles.map((rFile) => rFile.size)
    .reduce((currentTotalSize, currentFileSize) => currentTotalSize
      + currentFileSize);
  if (totalSize > MAX_SIZE_FILE_PERMITTED) {
    return null;
  }
  return arrayFormatFiles.map((rawF) => new FileToUpload(UUIDV1(), rawF.name, rawF.size, rawF.type));
};


export const generateActionsForCommit = (
  currentFilePath,
  filesToUpload,
) => filesToUpload.map((ftu) => {
  let encoding = 'text';
  const fileContent = ftu.getContent();
  let finalContent = fileContent;
  const fileName = ftu.getName();
  const filePath = currentFilePath !== '' ? `${decodeURIComponent(currentFilePath)}/${fileName}` : fileName;
  if (isFileExtensionForBase64Enc(ftu.getType())) { // Just these formats are encoded as base 64
    encoding = 'base64';
    finalContent = Base64ToArrayBuffer.encode(fileContent);
  }
  return {
    action: CREATE,
    file_path: filePath,
    content: finalContent,
    encoding,
  };
});

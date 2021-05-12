import CommitsApi from 'apis/CommitsApi';
import MergeRequestAPI from 'apis/MergeRequestApi';
import Base64ToArrayBuffer from 'base64-arraybuffer';
import { CREATE } from 'dataTypes';
import { convertToSlug } from 'functions/dataParserHelpers';
import UUIDV1 from 'uuid/v1';
import FileToUpload from './FileToUpload.ts';

const commitsapi = new CommitsApi();

const mergeRequestAPI = new MergeRequestAPI();

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

export const MAX_SIZE_FILE_PERMITTED = 50000000;

export const initialState = {
  filesToUpload: [],
  targetBranch: '',
  commitMsg: 'Upload new file',
  startMR: false,
  isAValidForm: false,
  areFilesLoaded: false,
  isSendingFiles: false,
};

export const isFileExtensionForBase64Enc = (type) => formatsWhichNeedbase64Encode
  .map((formatToTest) => type
    .includes(formatToTest))
  .filter((isIncluded) => isIncluded)
  .length > 0;

export const processFiles = (rawFiles) => {
  if (rawFiles?.length === 0) {
    throw new Error('Not valid files selected');
  }
  const arrayFormatFiles = Array.from(rawFiles);
  const totalSize = arrayFormatFiles?.map((rFile) => rFile.size)
    .reduce((currentTotalSize, currentFileSize) => currentTotalSize
    + currentFileSize);
  if (totalSize > MAX_SIZE_FILE_PERMITTED) {
    throw new Error('The files selected is larger than size permitted (100MB)');
  }
  return arrayFormatFiles
    .map((rawF) => new FileToUpload(
      UUIDV1(),
      rawF.name,
      rawF.size,
      rawF.type,
    ));
};

export const processAndSetStatus = (rawFiles, dispatch) => {
  const processedFiles = processFiles(rawFiles);
  dispatch({ type: SET_FILESUPLOAD, payload: processedFiles });
  processedFiles.forEach((pf, pfIndex) => {
    const fileReader = new FileReader();
    const f = rawFiles[pfIndex];
    fileReader.onloadend = () => {
      dispatch({
        type: SET_PROGRESS,
        payload: {
          fileId: pf.id,
          progress: 100,
        },
      });
      dispatch({ type: SET_CONTENT, payload: { fileId: pf.id, content: fileReader.result } });
    };
    if (isFileExtensionForBase64Enc(pf.type)) {
      fileReader.readAsArrayBuffer(f);
    } else {
      fileReader.readAsText(f);
    }
  });
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

export const createNewFiles = (
  gid,
  branchForFile,
  finalCommitMsg,
  startMR,
  pathForFile,
  finalArrayOfFilesToUpload,
  branches,
  currentBranch,
  dispatch,
) => {
  const slugVersionBranch = convertToSlug(branchForFile);
  let body = {
    branch: slugVersionBranch,
    commit_message: finalCommitMsg,
    actions: generateActionsForCommit(pathForFile || '/', finalArrayOfFilesToUpload),
  };

  if (!branches.includes(slugVersionBranch)) {
    body = { ...body, start_branch: currentBranch };
  }

  dispatch({ type: SET_SENDING_FILES, payload: true });

  return commitsapi.performCommitForMultipleActions(
    gid,
    JSON.stringify(body),
  )
    .then(() => {
      dispatch({ type: SET_FILESUPLOAD, payload: [] });
      dispatch({ type: SET_TARGET, payload: slugVersionBranch });
      if (startMR) {
        return mergeRequestAPI
          .submitMergeReq(gid, slugVersionBranch, currentBranch, 'Merge file to main branch')
          .then((bodyRes) => {
            const { source_branch: mrSourceBranch } = bodyRes;
            dispatch({ type: SET_TARGET, payload: mrSourceBranch });
            dispatch({ type: SET_LOADING, payload: true });
          });
      }
      dispatch({ type: SET_LOADING, payload: true });
    });
};

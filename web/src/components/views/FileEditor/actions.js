import CommitsApi from 'apis/CommitsApi';
import MergeRequestAPI from 'apis/MergeRequestApi';
import FilesApi from 'apis/FilesApi';
import { bannedCharsArray, CREATE, UPDATE } from 'dataTypes';
import { validateBranchName } from 'functions/validations';

const commitsApi = new CommitsApi();
const mergeRequestAPI = new MergeRequestAPI();
const filesApi = new FilesApi();

const getFileContent = (gid, filePath, ref, callback) => filesApi
  .getFileData(gid, filePath, ref)
  .then(callback);

const createFileAction = (
  projectId,
  targetBranch,
  path,
  filename,
  commitMessage,
  content,
  sourceBranch,
  newMergeRequest,
) => commitsApi.performCommit(
  projectId,
  path ? `${path}/${filename}` : filename,
  content,
  targetBranch,
  commitMessage,
  CREATE,
  'text',
  sourceBranch,
).then(() => {
  if (newMergeRequest) {
    return mergeRequestAPI
      .submitMergeReq(projectId, targetBranch, sourceBranch, `Merge request from ${targetBranch} to ${sourceBranch}`);
  }
});

const editFileAction = (
  projectId,
  targetBranch,
  path,
  commitMessage,
  content,
  sourceBranch,
  newMergeRequest,
) => commitsApi.performCommit(
  projectId,
  path,
  content,
  targetBranch,
  commitMessage,
  UPDATE,
  'text',
  sourceBranch,
).then(() => {
  if (newMergeRequest) {
    return mergeRequestAPI
      .submitMergeReq(projectId, targetBranch, sourceBranch, `Merge request from ${targetBranch} to ${sourceBranch}`);
  }
});

const validateFileName = (nameToTest) => {
  let bannedChars = 0;
  if (nameToTest.length === 0 || nameToTest.startsWith('-') || nameToTest.includes(' ')) return false;

  bannedCharsArray.forEach((char) => {
    if (nameToTest.includes(char)) {
      bannedChars += 1;
    }
  });

  return bannedChars === 0;
};

const getDisabledFileForm = (
  filename,
  targetBranch,
  commitMessage,
) => !validateFileName(filename) || targetBranch.includes(' ') || !validateBranchName(targetBranch) || commitMessage.length === 0;

const getDisabledEditFileForm = (
  targetBranch,
  commitMessage,
) => targetBranch.includes(' ') || !validateBranchName(targetBranch) || commitMessage.length === 0;

const getIsDisabledButton = (action, filename, targetBranch, commitMessage) => action === 'edit'
  ? getDisabledEditFileForm(targetBranch, commitMessage)
  : getDisabledFileForm(filename, targetBranch, commitMessage);

export default {
  createFileAction,
  editFileAction,
  getIsDisabledButton,
  getFileContent,
  validateFileName,
};

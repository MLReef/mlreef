import CommitsApi from 'apis/CommitsApi';
import MergeRequestAPI from 'apis/MergeRequestApi';
import { bannedCharsArray, CREATE } from 'dataTypes';

const commitsApi = new CommitsApi();
const mergeRequestAPI = new MergeRequestAPI();

const createFile = async (
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

export default {
  createFile,
  validateFileName,
};

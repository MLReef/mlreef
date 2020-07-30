import { POLL_TIMEOUT } from 'apiConfig';
import { PROJECT_TYPES } from 'domain/project/projectTypes';
import CommitsApi from '../apis/CommitsApi.ts';

const commitsApi = new CommitsApi();

export const getCommits = (projectId, commitBranch) => commitsApi.getCommits(projectId, commitBranch, '', 1);

export const getFileDifferences = async (projectId, diff, previousCommitId, lastCommitId) => {
  let previousVersionFile;
  let nextVersionFile;
  if (!diff.new_file) {
    previousVersionFile = await commitsApi.getFileDataInCertainCommit(
      projectId,
      encodeURIComponent(
        diff.old_path,
      ), previousCommitId,
    );
  }
  if (!diff.deleted_file) {
    nextVersionFile = await commitsApi.getFileDataInCertainCommit(
      projectId,
      encodeURIComponent(
        diff.old_path,
      ), lastCommitId,
    );
  }

  return { previousVersionFile, nextVersionFile };
};

/**
 * Suscribe to a real time (polling) communication.
 *
 * @param {Object} options
 * @param {Number[integer]} options.timeout interval in milliseconds (default 1000).
 * @param {Function} action the function to be called.
 * @param {any} args the parameter for the function.
 *
 * @return {Function} the unsuscribe function.
 */
export const suscribeRT = (options = {}) => (action, args) => {
  const {
    timeout,
  } = options;

  let timeoutId = null;

  const executeTimedAction = () => {
    action(args);

    timeoutId = setTimeout(executeTimedAction, timeout || POLL_TIMEOUT);
  };

  executeTimedAction();

  return () => {
    clearTimeout(timeoutId);
  };
};

// this returns an error if code is bigger than 400
// added an extra guard to avoid failing by bad json parsing
export const handleResponse = (res) => {
  if (!res.ok) return Promise.reject(res);

  return res.status !== 204 ? res.json() : res;
};

// eslint-disable-next-line
export const inspect = (res) => console.info(res) || res;

export const onlyDataProject = (project) =>
  project.searchableType === PROJECT_TYPES.DATA;

export const onlyCodeProject = (project) =>
  project.searchableType === PROJECT_TYPES.CODE;

export const handlePagination = ({ content }) => ([...content]);

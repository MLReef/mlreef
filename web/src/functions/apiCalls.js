import { POLL_TIMEOUT } from 'apiConfig';
import commitsApi from 'apis/CommitsApi';
import { PROJECT_TYPES } from 'domain/project/projectTypes';

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
export const handleResponse = (res) => res.ok ? res.json() : Promise.reject(res);

// eslint-disable-next-line
export const inspect = (res) => console.info(res) || res;


export const onlyDataProject = (project) =>
  project.searchableType === PROJECT_TYPES.DATA;

export const onlyCodeProject = (project) =>
  project.searchableType === PROJECT_TYPES.CODE;

export const handlePagination = ({ content }) => ([...content]);

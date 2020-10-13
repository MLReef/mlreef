import { DELETE } from 'dataTypes';
import CommitsApi from '../../apis/CommitsApi.ts';

const commitsApi = new CommitsApi();

const createCommit = (
  projectId,
  branch,
  filepath,
  commitMess,
  startBranch,
) => commitsApi.performCommit(
  projectId,
  filepath,
  null,
  branch,
  commitMess,
  DELETE,
  'text',
  startBranch,
);

export default {
  createCommit,
};

import CommitsApi from 'apis/CommitsApi';

const commitsApi = new CommitsApi();

const getCommits = (gid, branch, path) => commitsApi.getCommits(gid, branch, path);

export default {
  getCommits,
};

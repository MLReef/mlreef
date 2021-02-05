import BranchesApi from 'apis/BranchesApi.ts';

const brApi = new BranchesApi();

const createBranch = (
  gid,
  newBranchName,
  branchSelected,
) => brApi.create(
  gid,
  newBranchName,
  branchSelected,
);

export default {
  createBranch,
};

import BranchesApi from '../../apis/BranchesApi.ts';


const brApi = new BranchesApi();

const compareBranchesFunction = async (gitlabProjectId, branch1, branch2) => {
  const { commits: ahead } = await brApi.compare(gitlabProjectId, branch2, branch1);

  const { commits: behind } = await brApi.compare(gitlabProjectId, branch1, branch2);

  return { ahead, behind };
};

export default {
  compareBranchesFunction,
};

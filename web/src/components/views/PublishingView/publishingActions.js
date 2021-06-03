import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';

const projectApi = new ProjectGeneralInfoApi();

const publish = (projectId, body) => projectApi.publish(projectId, body);

const getNextVersion = (processors, branch) => {
  if (processors.length === 0) {
    return 1;
  }
  const processorsWithSpecificBranch = processors.filter((p) => p.branch === branch);
  if (processorsWithSpecificBranch.length === 0) {
    return 1;
  }

  const sortedArrayOfProcessors = processorsWithSpecificBranch.sort((p1, p2) => (
    parseInt(p2.version) > parseInt(p1.version) ? 1 : -1
  ));

  return parseInt(sortedArrayOfProcessors[0].version) + 1;
};

export default {
  publish,
  getNextVersion,
};

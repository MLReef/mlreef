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

const getPreviousPath = (path = '') => {
  if (!path) {
    return path;
  }

  const pathParts = path.split('/');

  pathParts.pop();

  let newPath = '';

  pathParts.forEach((part, index) => {
    if (index === 0) {
      newPath = part;
    } else {
      newPath = `${newPath}/${part}`;
    }
  });

  return newPath;
}

export default {
  publish,
  getNextVersion,
  getPreviousPath,
};

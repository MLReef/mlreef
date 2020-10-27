import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';

const projectApi = new ProjectGeneralInfoApi();

const publish = (projectId) => projectApi.publish(projectId);

export default {
  publish,
};

import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';

const projectApi = new ProjectGeneralInfoApi();

const publish = (projectId, republish) => projectApi.publish(projectId, republish);

export default {
  publish,
};

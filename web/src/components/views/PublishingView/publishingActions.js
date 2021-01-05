import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';

const projectApi = new ProjectGeneralInfoApi();

const publish = (projectId, body, republish) => projectApi.publish(projectId, body, republish);

export default {
  publish,
};

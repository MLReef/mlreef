import FilesApi from 'apis/FilesApi';
import ProjectGeneralInfoApi from 'apis/ProjectGeneralInfoApi';

const projectApi = new ProjectGeneralInfoApi();

const filesApi = new FilesApi();

const getEntryPointFileInfo = (codeProjectId) => projectApi
  .getProjectPublishStatus(codeProjectId)
  .then(({ path, publish_info: { commit_sha: commitSha } }) => ({ path, commitSha }))
  .then(async ({ path, commitSha }) => {
    const { gitlab_id: gid } = await projectApi.getCodeProjectById(codeProjectId);
    const fileInfo = await filesApi.getFileData(gid, path, commitSha);

    return fileInfo;
  });

export default {
  getEntryPointFileInfo,
};

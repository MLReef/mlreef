import { toastr } from 'react-redux-toastr';
import filesApi from '../apis/FilesApi';
import commitsApi from '../apis/CommitsApi';
import PipeLinesApi from 'apis/PipelinesApi';
import { getCurrentUserInformation } from './dataParserHelpers';

export const callToCommitApi = (
  projectId,
  branch,
  action,
  finalContent,
) => commitsApi.performCommit(
  projectId,
  '.mlreef.yml',
  finalContent,
  branch,
  'Stage branch for pipeline execution via API [skip ci]',
  action,
)
  .then((commit) => {
    const userInfo = getCurrentUserInformation();
    const dataPipelinePayload = {
      variables: [
        { key: 'GIT_PUSH_TOKEN', variable_type: 'env_var', value: userInfo.token },
        { key: 'GIT_PUSH_USER', variable_type: 'env_var', value: userInfo.userName },
        { key: 'GIT_USER_EMAIL', variable_type: 'env_var', value: userInfo.userEmail },
      ],
    };
    PipeLinesApi
      .create(commit.project_id, branch, dataPipelinePayload)
      .then(() => toastr.success('Success', 'Pipeline was generated'))
      .catch(() => toastr.error('Error', 'Pipeline creation failed'));
  })
  .catch((err) => err);

export const callToGetFilesInFolder = (
  path,
  branch,
  projectId,
  recursive,
) => filesApi
  .getFilesPerProject(projectId, path || '', recursive, branch)
  .catch((err) => err);

export const getFileDifferences = async (projectId, diff, previousCommitId, lastCommitId) => {
  let previousVersionFile;
  let nextVersionFile;
  if (!diff.new_file) {
    previousVersionFile = await commitsApi.getFileDataInCertainCommit(
      projectId,
      encodeURIComponent(
        diff.old_path,
      ), previousCommitId,
    );
  }
  if (!diff.deleted_file) {
    nextVersionFile = await commitsApi.getFileDataInCertainCommit(
      projectId,
      encodeURIComponent(
        diff.old_path,
      ), lastCommitId,
    );
  }

  return { previousVersionFile, nextVersionFile };
};

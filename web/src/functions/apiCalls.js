import filesApi from '../apis/FilesApi';
import commitsApi from '../apis/CommitsApi';

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
  'pipeline execution',
  action,
)
  .then((res) => {
    if (!res.id || typeof res.id === 'undefined') {
      callToCommitApi(branch, 'update', finalContent);
    }
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

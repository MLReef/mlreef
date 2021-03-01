import FilesApi from 'apis/FilesApi.ts';
import CommitsApi from 'apis/CommitsApi.ts';

const commitsApi = new CommitsApi();

const filesApi = new FilesApi();

const getCommit = (projectId, lastCommitId) => commitsApi
  .getCommitDetails(projectId, lastCommitId);

const getFileAndInformation = (gid, file, branch, commit) => filesApi
  .getFileData(gid, file?.includes('/') ? encodeURIComponent(file) : file, branch || commit)
  .then(async (fData) => {
    const commitInfoDet = await getCommit(gid, fData.last_commit_id);
    return {
      fData,
      commitInfoDet,
    };
  });

export default {
  getFileAndInformation,
};

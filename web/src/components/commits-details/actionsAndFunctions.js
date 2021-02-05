import CommitsApi from 'apis/CommitsApi';
import { getFileDifferences } from 'functions/apiCalls';

const commitsApi = new CommitsApi();

const imageFormats = [
  '.png',
  '.jpg',
];

const getDiffDetails = (gid, diffsArray, newCommits) => Promise.all(
  diffsArray.filter((diff) => imageFormats
    .filter((format) => diff.old_path.includes(format)).length > 0)
    .map(async (imageDiff) => {
      const {
        previousVersionFile,
        nextVersionFile,
        imageFileSize,
      } = await getFileDifferences(
        gid,
        imageDiff,
        newCommits.parent_ids[0],
        newCommits.id,
      );
      return {
        previousVersionFileParsed: previousVersionFile,
        nextVersionFileParsed: nextVersionFile,
        imageFileSize,
        fileName: imageDiff.old_path.split('/').slice(-1)[0],
      };
    }),
);

const loadDiffCommits = (gid, commits, commitHash, page) => commitsApi
  .getCommitDiff(gid, commitHash, page, true)
  .then(({ totalPages: tp, totalFilesChanged, body }) => ({
    tp,
    totalFilesChanged,
    imagePromises: getDiffDetails(gid, [...body], commits),
  }));

const getCommitDetails = (gid, commitHash) => commitsApi
  .getCommitDetails(gid, commitHash);

export default {
  getDiffDetails,
  getCommitDetails,
  loadDiffCommits,
};

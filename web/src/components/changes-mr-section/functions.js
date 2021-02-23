import { Base64 } from 'js-base64';
import Base64ToArrayBuffer from 'base64-arraybuffer';
import { getFileDifferences } from '../../functions/apiCalls';
import CommitsApi from 'apis/CommitsApi';
import { isImageFormat } from 'functions/dataParserHelpers';

const commitsApi = new CommitsApi();

export const fetchFileDiffInfo = (projectId, aheadCommits) => Promise.all(aheadCommits.map(async (commit, index) => {
  const { id: commitId } = commit;
  const commitDiffs = await commitsApi.getCommitDiff(projectId, commitId, 0, false);
  return await Promise.all(commitDiffs?.body?.map(async (commitDiff) => {
    const {
      previousVersionFile,
      nextVersionFile,
      imageFileSize,
    } = await getFileDifferences(projectId, commitDiff, commit.parent_ids[0], commit.id);
    let previousVersionFileParsed = previousVersionFile;
    let nextVersionFileParsed = nextVersionFile;
    let sizeDeleted = 0;
    let sizeAdded = 0;
    const fileName = commitDiff.old_path.split('/').slice(-1)[0];
    if (previousVersionFile && !isImageFormat(fileName)) {
      previousVersionFileParsed = Base64.decode(
        Base64ToArrayBuffer.encode(previousVersionFile),
      );
      sizeDeleted = previousVersionFile.byteLength;
    }
    if (nextVersionFile && !isImageFormat(fileName)) {
      nextVersionFileParsed = Base64.decode(Base64ToArrayBuffer.encode(nextVersionFile));
      sizeAdded = nextVersionFile.byteLength;
    }
    const path = commitDiff.new_path
      ? commitDiff.new_path
      : commitDiff.old_path;
    const fileExtension = path.split('.').pop().toLowerCase();
    return {
      fileName,
      fileExtension,
      previousVersionFileParsed,
      nextVersionFileParsed,
      id: `${commit.id} ${index}`,
      sizeDeleted,
      sizeAdded,
      imageFileSize,
    };
  }));
}));

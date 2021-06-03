import FilesApi from 'apis/FilesApi';

const filesApi = new FilesApi();

const getEntryPointFileInfo = (gid, commitSha, path) => filesApi.getFileData(gid, path, commitSha);

export default {
  getEntryPointFileInfo,
};

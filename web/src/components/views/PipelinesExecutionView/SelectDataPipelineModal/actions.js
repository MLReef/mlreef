import FilesApi from 'apis/FilesApi';

const filesApi = new FilesApi();

/**
 * Sometimes a pipeline is rebuilt so the files provided as input should be shown as selected
 * @param {*} file: file which was used as file input when a pipeline was executed
 */
function getIsFileChecked(initialFiles, file) {
  if (initialFiles.length === 0) return false;

  return initialFiles.filter((f) => f.location === file.path).length > 0;
}

const handleFiles = (filesRes, initialFiles) => filesRes.map((file) => ({
  ...file,
  checked: getIsFileChecked(initialFiles, file),
  disabled: !getIsFileChecked(initialFiles, file) && initialFiles.length !== 0,
}));

const getAndClassifyFiles = (
  gid,
  path,
  initialCommit,
  branchSelected,
) => filesApi.getFilesPerProject(
  gid,
  path,
  false,
  initialCommit || branchSelected,
);

export default {
  getAndClassifyFiles,
  handleFiles,
  getIsFileChecked,
};

import React, { useEffect, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import { useHistory } from 'react-router-dom';
import FilesTable from 'components/FilesTable/filesTable';
import FilesApi from 'apis/FilesApi';

const filesApi = new FilesApi();

const DataintanceFiles = (props) => {
  const {
    selectedProject,
    dataInsId,
    branchName,
    path,
  } = props;

  const history = useHistory();

  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (branchName) {
      filesApi.getFilesPerProject(
        selectedProject.gid,
        path || '',
        false,
        branchName,
      ).then(setFiles)
        .catch((err) => toastr.error('Error', err?.message));
    }
  }, [selectedProject.gid, path, branchName]);
  return (
    <FilesTable
      isReturnOptVisible={!!path}
      files={files.map((f) => ({ id: f.id, name: f.name, type: f.type }))}
      headers={[
        'Name',
      ]}
      onClick={(e) => {
        const target = e.currentTarget;
        const targetDataKey = target.getAttribute('data-key');
        const targetId = target.id;
        const file = files.filter((f) => f.id === targetId)[0];
        let link = '';
        let routeType = '';
        const baseUrl = `/${selectedProject?.gitlabNamespace}/${selectedProject?.slug}`;
        const encodedBranch = encodeURIComponent(branchName);
        const encodedPath = encodeURIComponent(file.path);
        if (targetDataKey === 'tree') {
          routeType = 'path';
          link = `${baseUrl}/-/datasets/${encodedBranch}/${dataInsId}/path/${encodedPath}`;
        } else {
          routeType = 'blob';
          link = `${baseUrl}/-/${routeType}/branch/${encodedBranch}/path/${encodedPath}`;
        }
        history.push(link);
      }}
    />
  );
};

export default DataintanceFiles;

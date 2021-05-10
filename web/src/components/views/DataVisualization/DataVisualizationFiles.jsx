import React, { useEffect, useState } from 'react';
import { toastr } from 'react-redux-toastr';
import FilesApi from 'apis/FilesApi';
import FilesTable from 'components/files-table/filesTable';
import { useHistory } from 'router';

const filesApi = new FilesApi();

const DataVisualizationFiles = (props) => {
  const {
    gid,
    namespace,
    slug,
    branchName,
    path,
  } = props;

  const history = useHistory();

  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (branchName) {
      filesApi.getFilesPerProject(
        gid,
        path || '',
        false,
        branchName,
      ).then((filesPerProject) => setFiles(filesPerProject))
        .catch(() => toastr.error('Error', 'Something went wrong fetching pipelines'));
    }
  }, [branchName, gid, path]);

  return (
    <FilesTable
      isReturnOptVisible={false}
      files={files.map((f) => ({ id: f.id, name: f.name, type: f.type }))}
      headers={['Name']}
      onClick={(e) => {
        const target = e.currentTarget;
        const targetDataKey = target.getAttribute('data-key');
        const targetId = target.id;
        const file = files.filter((f) => f.id === targetId)[0];
        let link = '';
        if (targetDataKey === 'tree') {
          link = `/${namespace}/${slug}/-/tree/${encodeURIComponent(branchName)}/${encodeURIComponent(file.path)}`;
        } else {
          link = `/${namespace}/${slug}/-/blob/branch/${branchName}/path/${encodeURIComponent(file.path)}`;
        }
        history.push(link);
      }}
    />
  );
};

export default DataVisualizationFiles;

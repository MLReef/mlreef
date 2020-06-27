import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import AuthWrapper from 'components/AuthWrapper';
import {
  string, number,
} from 'prop-types';
import { toastr } from 'react-redux-toastr';
import FilesTable from '../files-table/filesTable';
import FilesApi from '../../apis/FilesApi.ts';
import BranchesApi from '../../apis/BranchesApi.ts';

const FilesContainer = ({ projectId, path, urlBranch, defaultBranch }) => {
  const history = useHistory();
  const [ahead, setAhead] = useState(0);
  const [behind, setBehind] = useState(0);
  const [files, setFiles] = useState([]);
  const errorMessage = 'Error getting files info';
  const finalBranch = urlBranch && urlBranch !== 'null' && urlBranch !== 'null' ? urlBranch : defaultBranch;
  const isTheBranchDefault = defaultBranch === finalBranch;

  useEffect(() => {
    const filesApi = new FilesApi();
    if(projectId){
      filesApi.getFilesPerProject(
        projectId,
        path,
        false,
        finalBranch,
      ).then((files) => setFiles(files))
      .catch((err) => {
        console.log(err);
        toastr.error('Error', 'Something went wrong getting files')
      });
    }

    if(!isTheBranchDefault){
      const brApi = new BranchesApi();
      brApi.compare(projectId, finalBranch, defaultBranch)
      .then((res) => setAhead(res.commits.length))
      .catch(() => toastr.error('Error', errorMessage));
      brApi.compare(projectId, defaultBranch, finalBranch)
      .then((res) => setBehind(res.commits.length))
      .catch(() => toastr.error('Error', errorMessage));
    }
  }, [projectId, path, finalBranch, defaultBranch, isTheBranchDefault])

  return (
    <div className={`files-container ${defaultBranch && isTheBranchDefault ? 'files-container-master' : ''}`}>
    {!isTheBranchDefault && (
    <div className="commit-status px-3 py-2">
      <p id="commitStatus">
        This branch is
        {' '}
        <b>
          {ahead}
          {' '}
          commit(s)
        </b>
        {' '}
        ahead and
        {' '}
        <b>
          {behind}
          {' '}
          commit(s)
        </b>
        {' '}
        behind
        {' '}
        <b>&quot;{defaultBranch}&quot;.</b>
      </p>
      <AuthWrapper minRole={30}>
        <Link
          type="button"
          className="btn btn-basic-dark"
          to={`/my-projects/${projectId}/${finalBranch}/new-merge-request`}
        >
          Create merge request
        </Link>
      </AuthWrapper>
    </div>
    )}
    <FilesTable
      isReturnOptVisible={!!path}
      files={files.map((f) => ({ id: `${f.id} ${f.name}`, name: f.name, type: f.type }))}
      headers={['Name']}
      onClick={(e) => {
        const target = e.currentTarget;
        const targetDataKey = target.getAttribute('data-key');
        const targetId = target.id;
        const file = files.filter((f) => `${f.id} ${f.name}` === targetId)[0];
        if(!file){
          toastr.error('Error', 'Something wrong browsing app');
          return;
        }
        let routeType;
        if (targetDataKey === 'tree') {
          routeType = 'path';
        } else {
          routeType = 'blob';
        }
        const link = `/my-projects/${projectId}/${finalBranch}/${routeType}/${encodeURIComponent(file.path)}`;
        history.push(link);
      }}
    />
    </div>
)}

FilesContainer.propTypes = {
  projectId: number.isRequired,
  path: string,
  urlBranch: string.isRequired,
  defaultBranch: string.isRequired,
}

FilesContainer.defaultProps = {
  path: '',
}

export default FilesContainer;
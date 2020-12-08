import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { toastr } from 'react-redux-toastr';
import cx from 'classnames';
import MFileExplorer from 'components/ui/MFileExplorer';
import FilesApi from 'apis/FilesApi.ts';

const filesApi = new FilesApi();

const RepositoryFileExplorer = (props) => {
  const {
    className,
    onFileClicked,
  } = props;

  const {
    branches,
    projects: {
      selectedProject: {
        gid,
        defaultBranch,
      },
    },
  } = useSelector((s) => s);

  const [files, setFiles] = useState([]);
  const [path, setPath] = useState('');
  const [branch, setBranch] = useState(defaultBranch || 'master');
  const [waiting, setWaiting] = useState(false);

  const handleEnterDir = (e) => {
    setPath(`${path}${e.name}/`);
  };

  const handleExitDir = () => {
    const prev = path.split('/').slice(0, -2).join('/');

    setPath(prev ? `${prev}/` : '');
  };

  const handleBranchSelected = (name) => {
    setBranch(name);
  };

  useEffect(() => {
    if (gid) {
      setWaiting(true);
      filesApi.getFilesPerProject(gid, path, false, branch)
        .then(setFiles)
        .catch((err) => {
          toastr.error('Error', err.message);
        })
        .finally(() => setWaiting(false));
    }
  }, [gid, path, branch, defaultBranch, setWaiting]);

  return (
    <div className={cx('tabular-data-feeder', className)}>
      <MFileExplorer
        title={`/${path}`}
        branches={branches}
        files={files}
        onEnterDir={handleEnterDir}
        onExitDir={handleExitDir}
        onBranchSelected={handleBranchSelected}
        onFileClicked={onFileClicked}
        waiting={waiting}
        root={!path}
      />
    </div>
  );
};

RepositoryFileExplorer.defaultProps = {
  className: '',
};

RepositoryFileExplorer.propTypes = {
  className: PropTypes.string,
  onFileClicked: PropTypes.func.isRequired,
};

export default RepositoryFileExplorer;

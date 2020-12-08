import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import MBranchSelector from 'components/ui/MBranchSelector';
import { MLoadingSpinnerContainer } from 'components/ui/MLoadingSpinner';
import './MFileExplorer.scss';

const folderIcon = '/images/svg/folder_01.svg';
const fileIcon = '/images/svg/file_01.svg';

const MFileExplorer = (props) => {
  const {
    branches,
    files,
    selectable,
    title,
    className,
    root,
    onEnterDir,
    onExitDir,
    activeBranch,
    waiting,
    onBranchSelected,
    onFileSelected,
    onFileClicked,
  } = props;

  const handleFileCallback = (file) => file.callback
    ? file.callback(file)
    : onFileClicked(file);

  const handleClick = (file) => () => file.type === 'tree'
    ? onEnterDir(file)
    : handleFileCallback(file);

  return (
    <div className={cx('m-file-explorer', className)}>
      {branches.length > 0 && (
        <div className="m-file-explorer-branch-selector">
          <MBranchSelector
            activeBranch={activeBranch}
            branches={branches}
            onBranchSelected={onBranchSelected}
            showDatasets={false}
            showVisualizations={false}
            showExperiments={false}
          />
        </div>
      )}
      <div className="m-file-explorer-files">
        <div className="m-file-explorer-files-title border-rounded-top">
          {title}
        </div>
        <MLoadingSpinnerContainer active={waiting}>
          <ul className="m-file-explorer-files-list border-rounded-bottom">
            {!root && (
              <li className="m-file-explorer-files-list-item">
                <button
                  className="m-file-explorer-files-list-item-btn exit-btn"
                  type="button"
                  onClick={onExitDir}
                >
                  ..
                </button>
              </li>
            )}
            {files.map((file) => (
              <li key={file.id} className="m-file-explorer-files-list-item">
                {selectable && (
                  <MCheckBox
                    small
                    disabled={file.disabled || file.type === 'tree'}
                    className="mr-3 ml-2"
                    checked={file.selected}
                    name={file.id}
                    callback={onFileSelected}
                  />
                )}
                <button
                  className="m-file-explorer-files-list-item-btn"
                  type="button"
                  disabled={file.type !== 'tree' && (!onFileClicked && !file.callback)}
                  onClick={handleClick(file)}
                >
                  <div className="m-file-explorer-files-list-item-btn-file">
                    <div className="m-file-explorer-files-list-item-btn-file-icon">
                      <img src={file.type === 'tree' ? folderIcon : fileIcon} alt="icon" />
                    </div>
                    <div className="m-file-explorer-files-list-item-btn-file-label">
                      {file.name}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </MLoadingSpinnerContainer>
      </div>
    </div>
  );
};

MFileExplorer.defaultProps = {
  branches: [],
  files: [],
  title: 'Files of...',
  selectable: false,
  activeBranch: null,
  className: '',
  waiting: false,
  root: false,
  onFileSelected: () => {},
  onFileClicked: null,
};

MFileExplorer.propTypes = {
  branches: PropTypes.arrayOf(PropTypes.shape({

  })),
  files: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    callback: PropTypes.func,
    selected: PropTypes.bool,
  })),
  title: PropTypes.string,
  selectable: PropTypes.bool,
  onEnterDir: PropTypes.func.isRequired,
  onExitDir: PropTypes.func.isRequired,
  onBranchSelected: PropTypes.func.isRequired,
  onFileSelected: PropTypes.func,
  onFileClicked: PropTypes.func,
  activeBranch: PropTypes.string,
  className: PropTypes.string,
  waiting: PropTypes.bool,
  root: PropTypes.bool,
};

export default MFileExplorer;

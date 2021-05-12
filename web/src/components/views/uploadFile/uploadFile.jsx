import React, { 
  useRef, useEffect, useReducer, useCallback,
} from 'react';
import { connect } from 'react-redux';
import {
  string,
  shape,
  func,
  arrayOf,
} from 'prop-types';
import { toastr } from 'react-redux-toastr';
import './uploadFile.scss';
import { Redirect } from 'react-router';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import MButton from 'components/ui/MButton';
import hooks from 'customHooks/useSelectedProject';
import MBreadcrumb from 'components/ui/MBreadcrumb';
import {
  SET_TARGET,
  SET_MSG,
  SET_MR,
  SET_UPLOADBTN,
  SET_SENDING_FILES,
  initialState,
  REMOVE_FILE,
  createNewFiles,
  processAndSetStatus,
} from './uploadConstantsAndFunctions';
import reducer from './uploadFileReducer';
import Navbar from '../../navbar/navbar';
import FileToSend from './fileToSend';

const UploadFile = (props) => {
  const fileInput = useRef(null);
  const dragZone = useRef(null);
  const {
    branches,
    history,
    match: {
      params: {
        branch: currentBranch,
        path,
        namespace,
        slug: urlSlug,
      },
    },
  } = props;
  const [{
    name,
    gid,
    slug,
    namespace: groupName,
    emptyRepo: isEmptyRepo,
    defaultBranch,
  }] = hooks.useSelectedProject(namespace, urlSlug);

  const getAValidTargetBranch = () => {
    if (isEmptyRepo) {
      return 'master';
    }

    if (currentBranch && branches.includes(currentBranch)) {
      return currentBranch;
    }

    return defaultBranch;
  };

  const [{
    filesToUpload,
    fileContent,
    targetBranch,
    commitMsg,
    isAValidForm,
    areFilesLoaded,
    startMR,
    isSendingFiles,
  }, dispatch] = useReducer(
    reducer, {
      ...initialState,
      targetBranch: getAValidTargetBranch(),
    },
  );

  const breadcrumbs = [
    { name: groupName, href: `/${namespace}` },
    { name },
    { name: 'Data', href: `/${namespace}/${slug}` },
    { name: 'Upload a file' },
  ];

  const areFilesLoading = filesToUpload.filter((file) => file.getProg() < 100).length > 0;
  useEffect(() => {
    dispatch({
      type: SET_UPLOADBTN,
      payload: filesToUpload.length > 0 && commitMsg.length > 0,
    });
  }, [filesToUpload, fileContent, commitMsg]);

  const handleUploadFile = () => createNewFiles(
    gid,
    targetBranch,
    commitMsg,
    startMR,
    path,
    filesToUpload,
    branches,
    currentBranch,
    dispatch,
  ).catch(() => toastr.error('Error', 'File could not be uploaded'))
    .finally(() => dispatch({ type: SET_SENDING_FILES, payload: false }));

  const redirectBackToFolder = path
    ? `${encodeURIComponent(targetBranch)}/${path}`
    : encodeURIComponent(targetBranch);

  const handleFileDrop = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    const { dataTransfer: { files } } = e;
    try {
      processAndSetStatus(files, dispatch);
    } catch (error) {
      toastr.error('Error', error.message);
    }
    dragZone.current.classList.remove('file-hover');
  }, [dispatch]);

  const dragOver = (e) => {
    e.preventDefault();
    dragZone.current.classList.add('file-hover');
  };

  const handleFileDragEnter = (e) => {
    e.preventDefault();
    dragZone.current.classList.add('file-hover');
  };

  const handleFileDragEnd = (e) => {
    e.preventDefault();
    dragZone.current.classList.remove('file-hover');
  };

  const handleFileDragLeave = (e) => {
    e.preventDefault();
    dragZone.current.classList.remove('file-hover');
  };

  return (
    <>
      {areFilesLoaded && <Redirect to={`/${groupName}/${slug}/-/tree/${redirectBackToFolder}`} /> }
      <Navbar />
      <div className="main-content">
        <MBreadcrumb items={breadcrumbs} />
        <div
          ref={dragZone}
          onDrop={handleFileDrop}
          onDragOver={dragOver}
          onDragEnter={handleFileDragEnter}
          onDragLeave={handleFileDragLeave}
          onDragEnd={handleFileDragEnd}
          className="draggable-container d-flex"
        >
          <input
            className="file-browser-input"
            type="file"
            id="file"
            accept="*"
            onChange={useCallback(
              (e) => processAndSetStatus(e.target.files, dispatch), 
              [dispatch],
            )}
            multiple
            ref={fileInput}
          />
          <div>
            <h2>Drag files to add them to your repository</h2>
            or
            {' '}
            <label htmlFor="file">
              <span id="file" className="choose-file" aria-controls="filename" type="button">
                Choose your files
              </span>
            </label>
          </div>
        </div>
        {filesToUpload.length > 0 && filesToUpload.map((ftU) => (
          <FileToSend
            key={`file sec for ${ftU.getId()}`}
            fileId={ftU.getId()}
            fileName={ftU.getName()}
            progress={ftU.getProg()}
            onRemove={(fileId) => dispatch({ type: REMOVE_FILE, payload: { fileId } })}
          />
        ))}
        <div className="upload-commit-message d-flex mb-3">
          <span className="upload-label">Path</span>
          <p className="m-0 p-1">
            <b>
              {slug}
              {' '}
              /
              {' '}
              {path ? decodeURIComponent(path) : ''}
            </b>
          </p>
        </div>
        <div className="upload-commit-message d-flex mb-3">
          <span className="upload-label">Commit message</span>
          <textarea
            id="commitMss-text-area"
            value={commitMsg}
            onChange={(e) => dispatch({ type: SET_MSG, payload: e.target.value })}
            rows="5"
            maxLength="250"
            spellCheck="false"
            placeholder="Description Format"
          />
        </div>
        <div className="target-branch d-flex">
          <span className="upload-label">Target branch</span>
          <div className="target-input-box d-flex">
            <input
              id="target-branch"
              type="text"
              value={targetBranch}
              onChange={(e) => dispatch({ type: SET_TARGET, payload: e.target.value })}
              readOnly={isEmptyRepo}
            />
            <div>
              {!isEmptyRepo && targetBranch !== currentBranch && (
                <MCheckBox
                  defaultChecked
                  key="isNewMr comp"
                  name="isNewMr"
                  labelValue="Start a new merge request with these changes"
                  callback={(...args) => dispatch({ type: SET_MR, payload: args[2] })}
                />
              )}
            </div>
          </div>
        </div>
        <div className="form-submit-buttons mt-2 d-flex">
          <button
            id="cancel-button"
            type="button"
            variant="contained"
            className="btn btn-switch"
            onClick={() => history.goBack()}
          >
            Cancel
          </button>
          <MButton
            type="submit"
            disabled={!isAValidForm || areFilesLoading || isSendingFiles}
            waiting={areFilesLoading || isSendingFiles}
            label="Upload file"
            className="btn btn-primary"
            onClick={handleUploadFile}
          />
        </div>
      </div>
    </>
  );
};

UploadFile.propTypes = {
  branches: arrayOf(string).isRequired,
  match: shape({
    params: shape({
      branch: string.isRequired,
    }).isRequired,
  }).isRequired,
  history: shape({
    goBack: func.isRequired,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    selectedProject: state.projects.selectedProject,
    branches: state.branches.map((branch) => branch.name),
    username: state.user.username,
  };
}

export default connect(mapStateToProps)(UploadFile);

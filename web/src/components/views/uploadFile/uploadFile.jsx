import React, { useRef, useEffect, useReducer } from 'react';
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
import MergeRequestAPI from 'apis/MergeRequestApi.ts';
import { randomNameGenerator } from 'functions/pipeLinesHelpers';
import MButton from 'components/ui/MButton';
import CommitsApi from '../../../apis/CommitsApi.ts';
import {
  SET_FILESUPLOAD,
  SET_CONTENT,
  SET_TARGET,
  SET_MSG,
  SET_MR,
  SET_UPLOADBTN,
  SET_PROGRESS,
  SET_LOADING,
  initialState,
  isFileExtensionForBase64Enc,
  generateActionsForCommit,
  REMOVE_FILE,
  processFiles,
  SET_SENDING_FILES,
} from './uploadConstantsAndFunctions';
import reducer from './uploadFileReducer';
import ProjectNav from '../../project-nav/projectNav';
import Navbar from '../../navbar/navbar';
import FileToSend from './fileToSend';
import { convertToSlug } from 'functions/dataParserHelpers';

const commitsapi = new CommitsApi();

const mergeRequestAPI = new MergeRequestAPI();

const UploadFile = (props) => {
  const fileInput = useRef(null);
  const dragZone = useRef(null);
  const {
    selectedProject: {
      name,
      gid,
      slug,
      namespace: groupName,
      emptyRepo: isEmptyRepo,
      defaultBranch,
    },
    branches,
    history,
    match: { params: { branch: currentBranch, path } },
  } = props;

  const getAValidTargetBranch = () => {
    if (isEmptyRepo) {
      return 'master';
    }

    if (currentBranch && branches.includes(currentBranch)) {
      return currentBranch;
    }

    return defaultBranch;
  };

  const [state, dispatch] = useReducer(
    reducer, {
      ...initialState,
      targetBranch: getAValidTargetBranch(),
    },
  );
  const {
    filesToUpload,
    fileContent,
    targetBranch,
    commitMsg,
    isAValidForm,
    areFilesLoaded,
    startMR,
    isSendingFiles,
  } = state;
  const folders = [groupName, name, 'Data', 'Upload a file'];
  const areFilesLoading = filesToUpload.filter((file) => file.getProg() < 100).length > 0;
  useEffect(() => {
    dispatch({
      type: SET_UPLOADBTN,
      payload: filesToUpload.length > 0 && commitMsg.length > 0,
    });
  }, [filesToUpload, fileContent, commitMsg]);

  const removeFiles = (fileId) => fileId
    ? dispatch({ type: REMOVE_FILE, payload: { fileId } })
    : dispatch({ type: SET_FILESUPLOAD, payload: [] });

  const createNewFiles = (
    branchForFile,
    finalCommitMsg,
    pathForFile,
    finalArrayOfFilesToUpload,
  ) => {
    const slugVersionBranch = convertToSlug(branchForFile);
    let body = {
      branch: slugVersionBranch,
      commit_message: finalCommitMsg,
      actions: generateActionsForCommit(pathForFile || '/', finalArrayOfFilesToUpload),
    };

    if (!branches.includes(slugVersionBranch)) {
      body = { ...body, start_branch: currentBranch };
    }

    dispatch({ type: SET_SENDING_FILES, payload: true });
    commitsapi.performCommitForMultipleActions(
      gid,
      JSON.stringify(body),
    )
      .then(() => {
        removeFiles();
        dispatch({ type: SET_TARGET, payload: slugVersionBranch });
        if (startMR) {
          toastr.info('Info', 'Creating your new MR');
          mergeRequestAPI
            .submitMergeReq(gid, slugVersionBranch, currentBranch, 'Merge file to main branch')
            .then((bodyRes) => {
              const { source_branch: mrSourceBranch } = bodyRes;
              dispatch({ type: SET_TARGET, payload: mrSourceBranch });
              dispatch({ type: SET_LOADING, payload: true });
              toastr.success('Success', 'MR was opened');
            }).catch(() => toastr.error('Error', 'Something failed opening the MR'));
        } else {
          toastr.success('Success', 'File was uploaded successfully');
          dispatch({ type: SET_LOADING, payload: true });
        }
      })
      .catch(() => toastr.error('Error', 'File could not be uploaded'))
      .finally(() => dispatch({ type: SET_SENDING_FILES, payload: false }));
  };

  const handleUploadFile = () => createNewFiles(
    targetBranch,
    commitMsg,
    path,
    filesToUpload,
  );

  const redirectBackToFolder = path
    ? `${encodeURIComponent(targetBranch)}/${path}`
    : encodeURIComponent(targetBranch);

  const processAndSetStatus = (rawFiles) => {
    try {
      const processedFiles = processFiles(rawFiles);
      dispatch({ type: SET_FILESUPLOAD, payload: processedFiles.filter((pf) => pf.isValid) });
      processedFiles.forEach((pf, pfIndex) => {
        if (!pf.isValid) {
          toastr.warning('Warning', `The "${pf.getName()}" file is not valid`);
          return;
        }
        const f = rawFiles[pfIndex];
        const fileReader = new FileReader();
        fileReader.addEventListener('progress', (event) => {
          dispatch({
            type: SET_PROGRESS,
            payload: {
              fileId: pf.id,
              progress: Math.round((event.loaded / event.total) * 100),
            },
          });
        });
        fileReader.onloadend = () => {
          const content = fileReader.result;
          dispatch({ type: SET_CONTENT, payload: { fileId: pf.id, content } });
          dispatch({
            type: SET_PROGRESS,
            payload: {
              fileId: pf.id,
              progress: 100,
            },
          });
        };
        if (isFileExtensionForBase64Enc(pf.type)) {
          fileReader.readAsArrayBuffer(f);
        } else {
          fileReader.readAsText(f);
        }
      });
    } catch (error) {
      toastr.error('Error', error.message);
    }
  };

  const handleFileChosen = (rawFiles) => processAndSetStatus(rawFiles);

  const handleFileDrop = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const { dataTransfer: { files } } = e;
    processAndSetStatus(files);
    dragZone.current.classList.remove('file-hover');
  };

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
        <ProjectNav projectId={gid} folders={folders} />
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
            onChange={(e) => handleFileChosen(e.target.files)}
            multiple
            ref={fileInput}
          />
          <div>
            <h2>Drag files to add them to your repository</h2>
            or
            {' '}
            <label htmlFor="file">
              <span id="file" className="choose-file" tabIndex="0" aria-controls="filename" type="button">
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
            onRemove={removeFiles}
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
              {path}
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
              readOnly={isEmptyRepo && true}
            />
            <div>
              {!isEmptyRepo && (
                <MCheckBox
                  defaultChecked
                  key="isNewMr comp"
                  name="isNewMr"
                  labelValue="Start a new merge request with these changes"
                  callback={(name, labelValue, newValue) => {
                    dispatch({ type: SET_MR, payload: newValue });
                  }}
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
            waiting={areFilesLoading || isSendingFiles}
            label="Upload file"
            className="btn btn-primary"
            onClick={() => !isAValidForm || areFilesLoading || isSendingFiles
              ? () => {}
              : handleUploadFile()}
          />
        </div>
      </div>
    </>
  );
};

UploadFile.propTypes = {
  selectedProject: shape({
    name: string.isRequired,
    namespace: string.isRequired,
    slug: string.isRequired,
  }).isRequired,
  branches: arrayOf(string).isRequired,
  match: shape({
    params: shape({
      branch: string.isRequired,
    }).isRequired,
  }).isRequired,
  history: shape({
    push: func.isRequired,
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

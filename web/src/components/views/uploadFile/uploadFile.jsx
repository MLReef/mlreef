import React, { useRef, useEffect, useReducer } from 'react';
import { connect } from 'react-redux';
import {
  string,
  shape,
  arrayOf
} from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';
import { toastr } from 'react-redux-toastr';
import Navbar from '../../navbar/navbar';
import ProjectNav from '../../project-nav/projectNav';
import file01 from 'images/file_01.svg';
import branchesApi from '../../../apis/BranchesApi';
import './uploadFile.scss';
import { Redirect, useHistory } from 'react-router';
import Base64ToArrayBuffer from 'base64-arraybuffer';
import { CREATE } from 'dataTypes';
import CommitsApi from 'apis/CommitsApi';
import MCheckBox from 'components/ui/MCheckBox/MCheckBox';
import {
  SET_FILEUPLOAD,
  SET_CONTENT,
  SET_TARGET,
  SET_MSG,
  SET_MR,
  SET_UPLOADBTN,
  SET_PROGRESS,
  SET_LOADING,
} from './uploadFileActions';
import reducer from './reducer';
import MergeRequestAPI from 'apis/mergeRequestApi';
import { randomNameGenerator } from 'functions/pipeLinesHelpers';

const MAX_SIZE_FILE_PERMITTED = 500000;

const UploadFile = (props) => {
  const history = useHistory();
  const fileInput = useRef(null);
  let fileReader;
  const {
    projects: { selectedProject: { name, id: projectId, namespace: { name: groupName }, empty_repo } },
    match: { params: { branch: currentBranch } },
    location: { state: { currentFilePath } },
  } = props;
  const initialState = {
    fileUploaded: null,
    fileContent: null,
    targetBranch: currentBranch || 'master',
    commitMsg: 'Upload New File',
    startMR: true,
    isAValidForm: false,
    progress: 0,
    isFileLoaded: false,
  };
  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    fileUploaded,
    fileContent,
    targetBranch,
    commitMsg,
    isAValidForm,
    progress,
    isFileLoaded,
    startMR,
  } = state;
  const folders = [groupName, name, 'Data', 'Upload a file'];

   useEffect(() => {
    dispatch({
      type: SET_UPLOADBTN, 
      payload: fileUploaded && commitMsg.length > 0
    });
  }, [fileUploaded, fileContent, commitMsg]);

  const createFileInNewBranch = () => {
    branchesApi.create(
      projectId,
      `branch-to-upload-files-${randomNameGenerator()}`,
      currentBranch,
    )
      .then((res) => {
        toastr.success('Success:', 'The branch was created');
        dispatch({ type: SET_TARGET, payload: res.name });
        createNewFile(res.name);
      })
      .catch(() => toastr.error("Error", "Error creating branch"));
  };

  const createNewFile = (branchForFile) => {
    const { name: fileName, type } = fileUploaded;
    let encoding = 'text';
    let finalContent = fileContent;
    if(type.includes('image')
      || type.includes('doc')
      || type.includes('pdf')
      || type.includes('docx')){ // Just these formats are encoded as base 64
      encoding = 'base64';
      finalContent = Base64ToArrayBuffer.encode(fileContent);
    }
    const filePath = currentFilePath !== '' ? `${decodeURIComponent(currentFilePath)}/${fileName}` : fileName;
    CommitsApi.performCommit(
      projectId,
      filePath,
      finalContent,
      branchForFile,
      commitMsg,
      CREATE,
      encoding,
    )
      .then(() => {
        toastr.success('Success', 'File was uploaded successfully');
        dispatch({ type: SET_LOADING, payload: true });
        removeFile();
        if(startMR && !empty_repo){
          toastr.info("Info", "Creating your new MR");
          MergeRequestAPI
            .submitMergeReq(projectId, branchForFile, targetBranch || 'master', `Merge file to master`)
            .then(() => {
              toastr.success("Success", "MR was opened");
            });
        }
      })
      .catch(() => toastr.error('Error', 'File could not be uploaded'));
  }

  const handleUploadFile = () => {
    if(startMR && !empty_repo){
      createFileInNewBranch();
      return;
    }

    createNewFile(targetBranch);
  };

  const handleFileRead = () => {
    const content = fileReader.result;
    dispatch({ type: SET_CONTENT, payload: content });
  };

  const handleFileChosen = (file) => {
    if(file.size > MAX_SIZE_FILE_PERMITTED){
      toastr.error("Error", "Max size permitted is 500KB");
      return;
    }

    dispatch({ type: SET_FILEUPLOAD, payload: file });
    fileReader = new FileReader();
    fileReader.addEventListener('progress', (event) => {
      dispatch({ 
        type: SET_PROGRESS, 
        payload: Math.round((event.loaded / event.total) * 100),
      });
    });
    fileReader.onloadend = handleFileRead;
    if(file.type.includes('image')){
      fileReader.readAsArrayBuffer(file);
    } else {
      fileReader.readAsText(file);
    }
  };

  const handleDrop = (e) => {
    e.stopPropagation();
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
  };

  const removeFile = () => {
    dispatch({ type: SET_PROGRESS, payload: 0 });
    dispatch({ type: SET_FILEUPLOAD, payload: null });
    dispatch({ type: SET_CONTENT, payload: null });
  };

  return (
    <>
      {isFileLoaded && <Redirect to={`/my-projects/${projectId}/${targetBranch}`} /> }
      <Navbar />
      <div className="main-content">
        <ProjectNav key="1" projectId="1" folders={folders} />
        <div
          onDrop={(e) => handleDrop(e)}
          className="draggable-container d-flex"
        >
          <input
            className="file-browser-input"
            type="file"
            id="file"
            accept=".*,image/*"
            onChange={(e) => handleFileChosen(e.target.files[0])}
            ref={fileInput}
          />
          <div>
            <h2>Drag files to add them to your repository</h2>
            or
            {' '}
            <label htmlFor="file">
              <span className="choose-file" tabIndex="0" aria-controls="filename" type="button">
                Choose your files
              </span>
            </label>
          </div>
        </div>
        {fileUploaded && (
          <>
            <LinearProgress variant="determinate" value={progress} />
            <div className="file-uploaded d-flex">
              <img className="dropdown-white" src={file01} alt="File" />
              <p>
                Uploaded
                {' '}
                {fileUploaded.name}
                {' '}
              </p>
              <button
                className="remove-file-button"
                onClick={removeFile}
                type="button"
              >
                <b>X</b>
              </button>
            </div>
          </>
        )}
        <div className="upload-commit-message d-flex">
          <h3>Commit message</h3>
          <textarea
            value={commitMsg}
            onChange={(e) => dispatch({ type: SET_MSG, payload: e.target.value})}
            rows="4"
            maxLength="250"
            spellCheck="false"
            placeholder="Description Format"
          />
        </div>
        <div className="target-branch d-flex">
          <h3>Target branch</h3>
          <div className="target-input-box d-flex">
            <input
              type="text"
              value={targetBranch}
              onChange={(e) => dispatch({type: SET_TARGET, payload: e.target.value})}
              readOnly={empty_repo && true}
            />
            <div>
              <MCheckBox
                defaultChecked
                key="isNewMr comp"
                name="isNewMr"
                labelValue="Start a new merge request with these changes"
                callback={(name, labelValue, newValue) => {
                  dispatch({ type: SET_MR, payload: newValue })
                }}
              />
            </div>
          </div>
        </div>
        <div className="form-submit-buttons mt-2 d-flex">
          <button
            id="cancel-button"
            variant="contained"
            className="btn btn-switch"
            onClick={() => history.push(`/my-projects/${projectId}/master`)}
          >
            Cancel
          </button>
            <button
              className={isAValidForm ? "btn btn-primary" : "btn btn-basic-primary"}
              disabled={!isAValidForm}
              onClick={handleUploadFile}
            >
              Upload file
            </button>
        </div>
      </div>
    </>
  );
};

UploadFile.propTypes = {
  projects: shape({
    selectedProject: shape({
      name: string.isRequired,
      namespace: shape({
        name: string.isRequired,
      }),
    }).isRequired,
  }).isRequired,
  match: shape({
    params: shape({
      branch: string.isRequired,
    }).isRequired,
  }).isRequired,
  branches: arrayOf(string).isRequired,
};

function mapStateToProps(state) {
  return {
    projects: state.projects,
    branches: state.branches.map((branch) => branch.name),
    username: state.user.username,
  };
}

export default connect(mapStateToProps)(UploadFile);

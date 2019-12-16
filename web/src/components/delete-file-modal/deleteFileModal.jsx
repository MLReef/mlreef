import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import {
  bool, string, arrayOf, func,
} from 'prop-types';
import { Checkbox, FormControlLabel, Button } from '@material-ui/core';
import { toastr } from 'react-redux-toastr';
import BlueBorderedInput from '../BlueBorderedInput';
import '../../css/globalStyles.css';
import '../../css/genericModal.css';
import './deleteFileModal.css';
import CustomizedButton from '../CustomizedButton';
import CustomizedMenus from '../customized-menu/CustomizedMenu';
import commitsApi from '../../apis/CommitsApi';
import { DELETE } from '../../dataTypes';
import branchesApi from '../../apis/BranchesApi';

const DeleteFileModal = ({
  isModalVisible,
  fileName,
  branches,
  showDeleteModal,
  branchSelected,
  projectId,
  filepath,
}) => {
  const [isNewMR, setNewMR] = useState(false);
  const [commitMess, setCommitMess] = useState('');
  const [targetBranch, setTargetBranch] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const isEnabledDeleteBtn = commitMess.length > 0
    && (targetBranch.length > 0 || newBranchName.length > 0);
  const [loading, setLoading] = useState(false);
  const [urlToRedirectTo, setUrlToRedirectTo] = useState('');
  let placeholder = 'Select target branch';
  if (newBranchName !== '') {
    placeholder = newBranchName;
  } else if (targetBranch !== '') {
    placeholder = targetBranch;
  }
  function createCommit(url, branch) {
    commitsApi.performCommit(
      projectId,
      filepath,
      null,
      branch,
      commitMess,
      DELETE,
    ).then(() => {
      toastr.success('Success', 'File deleted successfully');
      setUrlToRedirectTo(url);
    }).catch((err) => {
      toastr.error('Error', err.message);
    });
  }

  function createBranchAndCommit(redirectUrl, newBranch) {
    branchesApi.create(
      projectId,
      newBranch,
      branchSelected,
    ).then(() => {
      toastr.success('Success', `Branch ${newBranch} created`);
      createCommit(redirectUrl, newBranch);
    })
      .catch((err) => toastr.error('Error', err.message));
  }

  if (!isModalVisible) {
    return null;
  }
  return (
    <>
      {urlToRedirectTo !== '' && <Redirect to={urlToRedirectTo} />}
      <div className="generic-modal">
        <div
          className="modal-content"
          style={{ width: '30%', left: '32%', minWidth: 500 }}
        >
          <div className="title-div">
            <p>
              <b>
                Delete
                {' '}
                {fileName}
              </b>
            </p>
            <button
              id="close-deletion-modal"
              type="button"
              onClick={() => {
                setNewBranchName('');
                setCommitMess('');
                setTargetBranch('');
                showDeleteModal();
              }}
              style={{ color: 'white' }}
            >
              <b>
                X
              </b>
            </button>
          </div>
          <div style={{ padding: '5%' }}>
            <BlueBorderedInput
              id="commit-message"
              defaultValue={`Delete ${fileName}`}
              multiline
              rows="4"
              style={{ width: '100%' }}
              onChange={(e) => { setCommitMess(e.target.value); }}
            />
            <br />
            <br />
            <CustomizedMenus
              placeholder={placeholder}
              options={branches}
              menuTitle="Select a branch"
              onOptionSelectedHandler={setTargetBranch}
              onInputChangeHandler={setNewBranchName}
            />
            {(newBranchName.length > 0 || targetBranch.length > 0) && (
            <>
              <br />
              <br />
              <FormControlLabel
                control={(
                  <Checkbox
                    id="span-new-merge-req"
                    checked={isNewMR}
                    color="primary"
                    inputProps={{
                      'aria-label': 'primary checkbox',
                    }}
                    onClick={() => setNewMR(!isNewMR)}
                  />
              )}
                id="span-new-merge-req-lab"
                label="Start a new merge request with these changes"
              />
            </>
            )}
            <br />
            <br />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            >
              <Button
                id="cancel-file-deletion"
                variant="contained"
                onClick={() => {
                  setNewBranchName('');
                  setCommitMess('');
                  setTargetBranch('');
                  showDeleteModal();
                }}
              >
                Cancel
              </Button>
              {isEnabledDeleteBtn ? (
                <CustomizedButton
                  id="delete-file-btn"
                  onClickHandler={() => {
                    setLoading(!loading);
                    const baseUrl = `/my-projects/${projectId}`;
                    const isBranchExisting = (newBranchName === '');
                    if (isBranchExisting && isNewMR) {
                      createCommit(`${baseUrl}/${targetBranch}/new-merge-request`, targetBranch);
                    } else if (!isBranchExisting && isNewMR) {
                      createBranchAndCommit(`${baseUrl}/${newBranchName}/new-merge-request`, newBranchName);
                    } else if (isBranchExisting && !isNewMR) {
                      createCommit(`${baseUrl}/${targetBranch}`, targetBranch);
                    } else if (!isBranchExisting && !isNewMR) {
                      createBranchAndCommit(`${baseUrl}/${newBranchName}`, newBranchName);
                    }
                  }}
                  buttonLabel="Delete"
                  loading={loading}
                />
              ) : (
                <Button disabled type="button">Delete</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

DeleteFileModal.propTypes = {
  isModalVisible: bool.isRequired,
  projectId: string.isRequired,
  filepath: string.isRequired,
  fileName: string,
  branchSelected: string.isRequired,
  branches: arrayOf(string).isRequired,
  showDeleteModal: func.isRequired,
};

DeleteFileModal.defaultProps = {
  fileName: 'filename',
};

export default DeleteFileModal;
